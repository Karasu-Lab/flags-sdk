import { z } from "zod";

const flagResponseSchema = z.discriminatedUnion("ok", [
    z.object({
        ok: z.literal(true),
        value: z.boolean(),
        type: z.literal("boolean"),
    }),
    z.object({ ok: z.literal(false), error: z.string() }),
]);

export interface ApiFlagsOptions {
    baseUrl: string;
    origin: string;
}

export function createApiFlags<TSchema extends z.ZodObject<z.ZodRawShape>>(
    schema: TSchema,
    { baseUrl, origin }: ApiFlagsOptions,
): { [K in keyof z.infer<TSchema>]: () => Promise<z.infer<TSchema>[K]> } {
    const keys = Object.keys(schema.shape) as (keyof z.infer<TSchema> &
        string)[];
    const result = {} as {
        [K in keyof z.infer<TSchema>]: () => Promise<z.infer<TSchema>[K]>;
    };
    for (const key of keys) {
        result[key] = async () => {
            const path = key.split("/").map(encodeURIComponent).join("/");
            const response = await fetch(
                new URL(`/api/flags/${path}`, baseUrl),
                {
                    headers: { Origin: origin },
                    cache: "no-store",
                },
            );
            const body = flagResponseSchema.parse(await response.json());
            if (!body.ok)
                throw new Error(
                    `Failed to evaluate flag "${key}": ${body.error}`,
                );
            return body.value as z.infer<TSchema>[typeof key];
        };
    }
    return result;
}
