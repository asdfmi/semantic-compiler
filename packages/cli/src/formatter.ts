import type { NormalizedContext, NormalizedAggregate } from "./types.js";

function countTerms(ctx: NormalizedContext): number {
  return ctx.glossary.length;
}

function padEnd(s: string, len: number): string {
  return s + " ".repeat(Math.max(0, len - s.length));
}

// --- context list ---

export function formatContextList(
  contexts: NormalizedContext[],
  json: boolean,
): string {
  if (json) {
    return JSON.stringify(
      contexts.map((c) => ({
        name: c.name,
        aggregates: c.aggregates.length,
        terms: countTerms(c),
      })),
      null,
      2,
    );
  }

  if (contexts.length === 0) return "No contexts found.";

  const lines = ["Contexts:"];
  const maxName = Math.max(...contexts.map((c) => c.name.length));
  for (const ctx of contexts) {
    const agg = ctx.aggregates.length;
    const terms = countTerms(ctx);
    lines.push(
      `  ${padEnd(ctx.name, maxName)}  (${agg} aggregate${agg !== 1 ? "s" : ""}, ${terms} term${terms !== 1 ? "s" : ""})`,
    );
  }
  return lines.join("\n");
}

// --- context show ---

function formatAggregateOneLiner(agg: NormalizedAggregate): string {
  const root = agg.root ? `root: ${agg.root.name}, ` : "";
  const ent = agg.entities.length;
  const vo = agg.valueObjects.length;
  const inv = agg.invariants.length;
  return `  ${agg.name}  (${root}${ent} entit${ent !== 1 ? "ies" : "y"}, ${vo} value object${vo !== 1 ? "s" : ""}, ${inv} invariant${inv !== 1 ? "s" : ""})`;
}

export function formatContextShow(
  ctx: NormalizedContext,
  json: boolean,
): string {
  if (json) {
    return JSON.stringify(ctx, null, 2);
  }

  const lines: string[] = [`Context: ${ctx.name}`, ""];

  if (ctx.glossary.length > 0) {
    lines.push("Glossary:");
    const maxName = Math.max(...ctx.glossary.map((t) => t.name.length));
    for (const t of ctx.glossary) {
      lines.push(`  ${padEnd(t.name, maxName)}  — ${t.description}`);
    }
    lines.push("");
  }

  if (ctx.aggregates.length > 0) {
    lines.push("Aggregates:");
    for (const agg of ctx.aggregates) {
      lines.push(formatAggregateOneLiner(agg));
    }
  }

  return lines.join("\n");
}

// --- aggregate show ---

export function formatAggregateShow(
  agg: NormalizedAggregate,
  contextName: string,
  json: boolean,
): string {
  if (json) {
    return JSON.stringify({ ...agg, context: contextName }, null, 2);
  }

  const lines: string[] = [`Aggregate: ${agg.name}`, `  Context: ${contextName}`, ""];

  if (agg.root) {
    lines.push(`  Root: ${agg.root.name} (identity: ${agg.root.identity})`);
  }

  if (agg.entities.length > 0) {
    lines.push("");
    lines.push("  Entities:");
    for (const e of agg.entities) {
      lines.push(`    ${e.name} (identity: ${e.identity})`);
    }
  }

  if (agg.valueObjects.length > 0) {
    lines.push("");
    lines.push("  Value Objects:");
    lines.push(`    ${agg.valueObjects.map((vo) => vo.name).join(", ")}`);
  }

  if (agg.invariants.length > 0) {
    lines.push("");
    lines.push("  Invariants:");
    for (const inv of agg.invariants) {
      lines.push(`    - ${inv}`);
    }
  }

  return lines.join("\n");
}

// --- glossary ---

export function formatGlossary(
  ctx: NormalizedContext,
  json: boolean,
): string {
  if (json) {
    return JSON.stringify(
      { context: ctx.name, glossary: ctx.glossary },
      null,
      2,
    );
  }

  if (ctx.glossary.length === 0) return `Glossary: ${ctx.name}\n\n  (empty)`;

  const lines: string[] = [`Glossary: ${ctx.name}`, ""];
  const maxName = Math.max(...ctx.glossary.map((t) => t.name.length));
  for (const t of ctx.glossary) {
    lines.push(`  ${padEnd(t.name, maxName)}  — ${t.description}`);
  }
  return lines.join("\n");
}
