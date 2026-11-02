import type { FlagDeclaration } from "flags";
import type { Flag } from "flags/next";
import { flag } from "flags/next";
import type { z } from "zod";

/**
 * Derives one `flag()` declaration per key in `schema`'s shape, all sharing
 * `adapter`. Keeps the zod schema as the single source of truth for which
 * flags exist — callers never hand-write a matching `flag()` export per
 * schema field, so the schema and the evaluated flags can never drift out
 * of sync with each other.
 */
export function createSchemaFlags<TSchema extends z.ZodObject<z.ZodRawShape>>(
    schema: TSchema,
    adapter: NonNullable<FlagDeclaration<unknown, unknown>["adapter"]>,
): { [K in keyof z.infer<TSchema>]: Flag<z.infer<TSchema>[K]> } {
    const keys = Object.keys(schema.shape) as (keyof z.infer<TSchema>)[];
    const result = {} as {
        [K in keyof z.infer<TSchema>]: Flag<z.infer<TSchema>[K]>;
    };
    for (const key of keys) {
        result[key] = flag({ key: key as string, adapter }) as Flag<
            z.infer<TSchema>[typeof key]
        >;
    }
    return result;
}
