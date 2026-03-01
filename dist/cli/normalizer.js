function makeId(kind, name, source) {
    return `${kind}:${name.toLowerCase()}@${source.file}:${source.line}`;
}
function normalizeTerm(t) {
    return {
        kind: "term",
        id: makeId("term", t.name, t.source),
        name: t.name.trim(),
        description: t.description.trim(),
        source: t.source,
    };
}
function normalizeEntity(e) {
    return {
        kind: "entity",
        id: makeId("entity", e.name, e.source),
        name: e.name.trim(),
        identity: e.identity.trim(),
        source: e.source,
    };
}
function normalizeValueObject(vo) {
    const result = {
        kind: "valueObject",
        id: makeId("valueObject", vo.name, vo.source),
        name: vo.name.trim(),
        source: vo.source,
    };
    if (vo.identity !== undefined) {
        result.identity = vo.identity.trim();
    }
    return result;
}
function normalizeAggregate(a) {
    return {
        kind: "aggregate",
        id: makeId("aggregate", a.name, a.source),
        name: a.name.trim(),
        root: a.root ? normalizeEntity(a.root) : null,
        entities: a.entities.map(normalizeEntity),
        valueObjects: a.valueObjects.map(normalizeValueObject),
        invariants: a.invariants.map((s) => s.trim()),
        source: a.source,
    };
}
export function normalize(contexts) {
    return contexts.map((ctx) => ({
        kind: "context",
        id: makeId("context", ctx.name, ctx.source),
        name: ctx.name.trim(),
        glossary: ctx.glossary.map(normalizeTerm),
        aggregates: ctx.aggregates.map(normalizeAggregate),
        source: ctx.source,
    }));
}
