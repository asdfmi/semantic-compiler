export type Source = { file: string; line: number };

export type RawTerm = {
  kind: "term";
  name: string;
  description: string;
  source: Source;
};

export type RawEntity = {
  kind: "entity";
  name: string;
  identity: string;
  source: Source;
};

export type RawValueObject = {
  kind: "valueObject";
  name: string;
  identity?: string;
  source: Source;
};

export type RawAggregate = {
  kind: "aggregate";
  name: string;
  root: RawEntity | null;
  entities: RawEntity[];
  valueObjects: RawValueObject[];
  invariants: string[];
  source: Source;
};

export type RawContext = {
  kind: "context";
  name: string;
  glossary: RawTerm[];
  aggregates: RawAggregate[];
  source: Source;
};

export type NormalizedTerm = RawTerm & { id: string };
export type NormalizedEntity = RawEntity & { id: string };
export type NormalizedValueObject = RawValueObject & { id: string };

export type NormalizedAggregate = {
  kind: "aggregate";
  id: string;
  name: string;
  root: NormalizedEntity | null;
  entities: NormalizedEntity[];
  valueObjects: NormalizedValueObject[];
  invariants: string[];
  source: Source;
};

export type NormalizedContext = {
  kind: "context";
  id: string;
  name: string;
  glossary: NormalizedTerm[];
  aggregates: NormalizedAggregate[];
  source: Source;
};

