import type { NormalizedContext, NormalizedAggregate } from "./types.js";
export declare function formatContextList(contexts: NormalizedContext[], json: boolean): string;
export declare function formatContextShow(ctx: NormalizedContext, json: boolean): string;
export declare function formatAggregateShow(agg: NormalizedAggregate, contextName: string, json: boolean): string;
export declare function formatGlossary(ctx: NormalizedContext, json: boolean): string;
