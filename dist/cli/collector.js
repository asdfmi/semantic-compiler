import ts from "typescript";
import { readFileSync } from "fs";
function getLineNumber(sourceFile, pos) {
    return sourceFile.getLineAndCharacterOfPosition(pos).line + 1;
}
function extractStringProperty(obj, name) {
    for (const prop of obj.properties) {
        if (ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === name &&
            ts.isStringLiteral(prop.initializer)) {
            return prop.initializer.text;
        }
    }
    return undefined;
}
function extractStringArray(obj, name) {
    for (const prop of obj.properties) {
        if (ts.isPropertyAssignment(prop) &&
            ts.isIdentifier(prop.name) &&
            prop.name.text === name &&
            ts.isArrayLiteralExpression(prop.initializer)) {
            return prop.initializer.elements
                .filter(ts.isStringLiteral)
                .map((s) => s.text);
        }
    }
    return [];
}
function isCallTo(node, name) {
    return (ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === name);
}
function extractTerm(node, sourceFile, file) {
    const args = node.arguments;
    if (args.length >= 2 &&
        ts.isStringLiteral(args[0]) &&
        ts.isStringLiteral(args[1])) {
        return {
            kind: "term",
            name: args[0].text,
            description: args[1].text,
            source: { file, line: getLineNumber(sourceFile, node.getStart()) },
        };
    }
    return null;
}
function extractEntity(node, sourceFile, file) {
    const arg = node.arguments[0];
    if (arg && ts.isObjectLiteralExpression(arg)) {
        const name = extractStringProperty(arg, "name");
        const identity = extractStringProperty(arg, "identity");
        if (name && identity) {
            return {
                kind: "entity",
                name,
                identity,
                source: { file, line: getLineNumber(sourceFile, node.getStart()) },
            };
        }
    }
    return null;
}
function extractValueObject(node, sourceFile, file) {
    const arg = node.arguments[0];
    if (arg && ts.isObjectLiteralExpression(arg)) {
        const name = extractStringProperty(arg, "name");
        if (name) {
            const vo = {
                kind: "valueObject",
                name,
                source: { file, line: getLineNumber(sourceFile, node.getStart()) },
            };
            const identity = extractStringProperty(arg, "identity");
            if (identity) {
                vo.identity = identity;
            }
            return vo;
        }
    }
    return null;
}
function resolveEntityOrVo(node, sourceFile, file, bindings) {
    if (ts.isIdentifier(node)) {
        return bindings.get(node.text) ?? null;
    }
    if (isCallTo(node, "entity")) {
        return extractEntity(node, sourceFile, file);
    }
    if (isCallTo(node, "valueObject")) {
        return extractValueObject(node, sourceFile, file);
    }
    return null;
}
function extractAggregate(node, sourceFile, file, bindings) {
    const arg = node.arguments[0];
    if (!arg || !ts.isObjectLiteralExpression(arg))
        return null;
    const name = extractStringProperty(arg, "name");
    if (!name)
        return null;
    let root = null;
    const entities = [];
    const valueObjects = [];
    const invariants = extractStringArray(arg, "invariants");
    for (const prop of arg.properties) {
        if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name))
            continue;
        const pname = prop.name.text;
        if (pname === "root") {
            const resolved = resolveEntityOrVo(prop.initializer, sourceFile, file, bindings);
            if (resolved && resolved.kind === "entity") {
                root = resolved;
            }
        }
        else if (pname === "entities" || pname === "valueObjects") {
            if (ts.isArrayLiteralExpression(prop.initializer)) {
                for (const el of prop.initializer.elements) {
                    const resolved = resolveEntityOrVo(el, sourceFile, file, bindings);
                    if (resolved) {
                        if (resolved.kind === "entity")
                            entities.push(resolved);
                        else
                            valueObjects.push(resolved);
                    }
                }
            }
        }
    }
    return {
        kind: "aggregate",
        name,
        root,
        entities,
        valueObjects,
        invariants,
        source: { file, line: getLineNumber(sourceFile, node.getStart()) },
    };
}
function extractContext(node, sourceFile, file, bindings) {
    const arg = node.arguments[0];
    if (!arg || !ts.isObjectLiteralExpression(arg))
        return null;
    const name = extractStringProperty(arg, "name");
    if (!name)
        return null;
    const glossary = [];
    const aggregates = [];
    for (const prop of arg.properties) {
        if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name))
            continue;
        const pname = prop.name.text;
        if (pname === "glossary" && ts.isArrayLiteralExpression(prop.initializer)) {
            for (const el of prop.initializer.elements) {
                if (isCallTo(el, "term")) {
                    const t = extractTerm(el, sourceFile, file);
                    if (t)
                        glossary.push(t);
                }
            }
        }
        else if (pname === "aggregates" &&
            ts.isArrayLiteralExpression(prop.initializer)) {
            for (const el of prop.initializer.elements) {
                if (isCallTo(el, "aggregate")) {
                    const a = extractAggregate(el, sourceFile, file, bindings);
                    if (a)
                        aggregates.push(a);
                }
            }
        }
    }
    return {
        kind: "context",
        name,
        glossary,
        aggregates,
        source: { file, line: getLineNumber(sourceFile, node.getStart()) },
    };
}
export function collectFile(filePath) {
    const text = readFileSync(filePath, "utf-8");
    const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
    // First pass: build binding map for top-level const declarations
    const bindings = new Map();
    for (const stmt of sourceFile.statements) {
        if (ts.isVariableStatement(stmt) &&
            stmt.declarationList.declarations.length > 0) {
            for (const decl of stmt.declarationList.declarations) {
                if (ts.isIdentifier(decl.name) &&
                    decl.initializer &&
                    ts.isCallExpression(decl.initializer)) {
                    const init = decl.initializer;
                    if (isCallTo(init, "entity")) {
                        const e = extractEntity(init, sourceFile, filePath);
                        if (e)
                            bindings.set(decl.name.text, e);
                    }
                    else if (isCallTo(init, "valueObject")) {
                        const vo = extractValueObject(init, sourceFile, filePath);
                        if (vo)
                            bindings.set(decl.name.text, vo);
                    }
                }
            }
        }
    }
    // Second pass: collect context calls
    const contexts = [];
    function visit(node) {
        if (isCallTo(node, "context")) {
            const ctx = extractContext(node, sourceFile, filePath, bindings);
            if (ctx)
                contexts.push(ctx);
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return contexts;
}
