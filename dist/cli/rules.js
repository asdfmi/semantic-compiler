function checkMissingInvariants(contexts, out) {
    for (const ctx of contexts) {
        for (const agg of ctx.aggregates) {
            if (agg.invariants.length === 0) {
                out.push({
                    code: "DX001",
                    severity: "error",
                    target: `Aggregate:${agg.name}`,
                    claim: "Every aggregate must declare at least one invariant.",
                    source: agg.source,
                    action: `Add an \`invariants\` array to aggregate "${agg.name}".`,
                });
            }
        }
    }
}
function checkNameCollisions(contexts, out) {
    for (const ctx of contexts) {
        // Collect unique (name, kind) pairs across the context.
        // Same (name, kind) is fine (shared VO across aggregates).
        // Aggregate root naturally shares name with its aggregate — skip that.
        // Flag: same name, different kind (entity vs VO), or duplicate entity names.
        const seen = new Map();
        for (const agg of ctx.aggregates) {
            const rootKey = agg.root ? agg.root.name.toLowerCase() : null;
            for (const e of [...agg.entities, ...(agg.root ? [agg.root] : [])]) {
                const ekey = e.name.toLowerCase();
                const prev = seen.get(ekey);
                if (prev) {
                    if (prev.kind !== e.kind) {
                        out.push({
                            code: "DX002",
                            severity: "error",
                            target: `Context:${ctx.name}`,
                            claim: `Name "${e.name}" (${e.kind}) collides with "${prev.name}" (${prev.kind}) — names must be unique within a context (case-insensitive).`,
                            source: e.source,
                            action: `Rename one of the colliding "${e.name}" definitions.`,
                        });
                    }
                    // Same kind, same name = shared reference, skip
                }
                else {
                    seen.set(ekey, { kind: e.kind, name: e.name, source: e.source });
                }
            }
            for (const vo of agg.valueObjects) {
                const vkey = vo.name.toLowerCase();
                const prev = seen.get(vkey);
                if (prev) {
                    if (prev.kind !== vo.kind) {
                        out.push({
                            code: "DX002",
                            severity: "error",
                            target: `Context:${ctx.name}`,
                            claim: `Name "${vo.name}" (${vo.kind}) collides with "${prev.name}" (${prev.kind}) — names must be unique within a context (case-insensitive).`,
                            source: vo.source,
                            action: `Rename one of the colliding "${vo.name}" definitions.`,
                        });
                    }
                }
                else {
                    seen.set(vkey, { kind: vo.kind, name: vo.name, source: vo.source });
                }
            }
        }
    }
}
function checkMissingRoot(contexts, out) {
    for (const ctx of contexts) {
        for (const agg of ctx.aggregates) {
            if (agg.root === null) {
                out.push({
                    code: "DX003",
                    severity: "error",
                    target: `Aggregate:${agg.name}`,
                    claim: "Every aggregate must have a root entity.",
                    source: agg.source,
                    action: `Add a \`root\` entity to aggregate "${agg.name}".`,
                });
            }
        }
    }
}
function checkVoHasIdentity(contexts, out) {
    for (const ctx of contexts) {
        for (const agg of ctx.aggregates) {
            for (const vo of agg.valueObjects) {
                if (vo.identity !== undefined) {
                    out.push({
                        code: "DX004",
                        severity: "warning",
                        target: `ValueObject:${vo.name}`,
                        claim: "A value object should not have an identity field — that makes it an entity.",
                        source: vo.source,
                        action: `Remove \`identity\` from value object "${vo.name}", or change it to an entity.`,
                    });
                }
            }
        }
    }
}
export function check(contexts) {
    const diagnostics = [];
    checkMissingInvariants(contexts, diagnostics);
    checkNameCollisions(contexts, diagnostics);
    checkMissingRoot(contexts, diagnostics);
    checkVoHasIdentity(contexts, diagnostics);
    return diagnostics;
}
