import type {
  RawContext,
  NormalizedContext,
  NormalizedAggregate,
  NormalizedEntity,
  NormalizedValueObject,
  NormalizedTerm,
  Source,
} from "./types.js";

function makeId(kind: string, name: string, source: Source): string {
  return `${kind}:${name.toLowerCase()}@${source.file}:${source.line}`;
}

function normalizeTerm(t: {
  kind: "term";
  name: string;
  description: string;
  source: Source;
}): NormalizedTerm {
  return {
    kind: "term",
    id: makeId("term", t.name, t.source),
    name: t.name.trim(),
    description: t.description.trim(),
    source: t.source,
  };
}

function normalizeEntity(e: {
  kind: "entity";
  name: string;
  identity: string;
  source: Source;
}): NormalizedEntity {
  return {
    kind: "entity",
    id: makeId("entity", e.name, e.source),
    name: e.name.trim(),
    identity: e.identity.trim(),
    source: e.source,
  };
}

function normalizeValueObject(vo: {
  kind: "valueObject";
  name: string;
  identity?: string;
  source: Source;
}): NormalizedValueObject {
  const result: NormalizedValueObject = {
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

function normalizeAggregate(
  a: RawContext["aggregates"][number],
): NormalizedAggregate {
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

export function normalize(contexts: RawContext[]): NormalizedContext[] {
  return contexts.map((ctx) => ({
    kind: "context" as const,
    id: makeId("context", ctx.name, ctx.source),
    name: ctx.name.trim(),
    glossary: ctx.glossary.map(normalizeTerm),
    aggregates: ctx.aggregates.map(normalizeAggregate),
    source: ctx.source,
  }));
}
