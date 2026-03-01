#!/usr/bin/env node
import { readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { collectFile } from "./collector.js";
import { normalize } from "./normalizer.js";
import { formatContextList, formatContextShow, formatAggregateShow, formatGlossary, } from "./formatter.js";
function walkFiles(dir, filename) {
    const results = [];
    for (const entry of readdirSync(dir)) {
        if (entry === "node_modules" || entry === "dist")
            continue;
        const full = join(dir, entry);
        const st = statSync(full);
        if (st.isDirectory()) {
            results.push(...walkFiles(full, filename));
        }
        else if (entry === filename) {
            results.push(full);
        }
    }
    return results;
}
const USAGE = `Usage: semantic-compiler <command> [options]

Commands:
  context list              List all contexts
  context show <name>       Show a specific context
  aggregate show <name>     Show a specific aggregate
  glossary <name>           Show glossary for a context

Options:
  --dir <path>    Source directory (default: ".")
  --json          Output as JSON`;
function parseArgs(argv) {
    const args = [];
    let json = false;
    let dir = ".";
    const rest = argv.slice(2);
    for (let i = 0; i < rest.length; i++) {
        if (rest[i] === "--json") {
            json = true;
        }
        else if (rest[i] === "--dir" && i + 1 < rest.length) {
            dir = rest[++i];
        }
        else if (!rest[i].startsWith("-")) {
            args.push(rest[i]);
        }
    }
    return { args, json, dir };
}
function loadContexts(dir) {
    const root = resolve(dir);
    const files = walkFiles(root, "definition.ts");
    const rawContexts = [];
    for (const file of files) {
        rawContexts.push(...collectFile(file));
    }
    return normalize(rawContexts);
}
function main() {
    const { args, json, dir } = parseArgs(process.argv);
    if (args.length === 0) {
        console.log(USAGE);
        process.exit(0);
    }
    const [resource, action, name] = args;
    if (resource === "context" && action === "list") {
        const contexts = loadContexts(dir);
        console.log(formatContextList(contexts, json));
        return;
    }
    if (resource === "context" && action === "show" && name) {
        const contexts = loadContexts(dir);
        const ctx = contexts.find((c) => c.name.toLowerCase() === name.toLowerCase());
        if (!ctx) {
            console.error(`Context "${name}" not found.`);
            process.exit(1);
        }
        console.log(formatContextShow(ctx, json));
        return;
    }
    if (resource === "aggregate" && action === "show" && name) {
        const contexts = loadContexts(dir);
        for (const ctx of contexts) {
            const agg = ctx.aggregates.find((a) => a.name.toLowerCase() === name.toLowerCase());
            if (agg) {
                console.log(formatAggregateShow(agg, ctx.name, json));
                return;
            }
        }
        console.error(`Aggregate "${name}" not found.`);
        process.exit(1);
    }
    if (resource === "glossary" && action) {
        const contexts = loadContexts(dir);
        const ctx = contexts.find((c) => c.name.toLowerCase() === action.toLowerCase());
        if (!ctx) {
            console.error(`Context "${action}" not found.`);
            process.exit(1);
        }
        console.log(formatGlossary(ctx, json));
        return;
    }
    console.error(`Unknown command: ${args.join(" ")}\n`);
    console.log(USAGE);
    process.exit(1);
}
main();
