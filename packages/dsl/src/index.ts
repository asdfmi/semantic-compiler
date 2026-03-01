export type TermDef = { kind: "term"; name: string; description: string };

export function term(name: string, description: string): TermDef {
  return { kind: "term", name, description };
}

export type EntityDef = {
  kind: "entity";
  name: string;
  identity: string;
};

export function entity(def: Omit<EntityDef, "kind">): EntityDef {
  return { kind: "entity", ...def };
}

export type ValueObjectDef = {
  kind: "valueObject";
  name: string;
};

export function valueObject(def: Omit<ValueObjectDef, "kind">): ValueObjectDef {
  return { kind: "valueObject", ...def };
}

export type AggregateDef = {
  kind: "aggregate";
  name: string;
  root: EntityDef;
  entities?: EntityDef[];
  valueObjects?: ValueObjectDef[];
  invariants: string[];
};

export function aggregate(def: Omit<AggregateDef, "kind">): AggregateDef {
  return { kind: "aggregate", ...def };
}

export type ContextDef = {
  kind: "context";
  name: string;
  glossary?: TermDef[];
  aggregates?: AggregateDef[];
};

export function context(def: Omit<ContextDef, "kind">): ContextDef {
  return { kind: "context", ...def };
}
