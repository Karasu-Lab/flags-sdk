import type { ReactNode } from "react";
import type { z } from "zod";
import { FeatureFlagsClientProvider } from "../client/feature-flags-context";

export interface ApiFeatureFlagsProviderProps<TSchema extends z.ZodType> {
    flags: {
        [K in keyof z.infer<TSchema>]: () => Promise<z.infer<TSchema>[K]>;
    };
    schema: TSchema;
    children: ReactNode;
}

export async function ApiFeatureFlagsProvider<TSchema extends z.ZodType>({
    flags: flagGetters,
    schema,
    children,
}: ApiFeatureFlagsProviderProps<TSchema>) {
    let flags: Record<string, unknown> | null;
    try {
        const entries = await Promise.all(
            Object.entries(flagGetters).map(
                async ([key, getValue]) =>
                    [
                        key,
                        await (getValue as () => Promise<unknown>)(),
                    ] as const,
            ),
        );
        flags = schema.parse(Object.fromEntries(entries)) as Record<
            string,
            unknown
        >;
    } catch {
        flags = null;
    }
    return (
        <FeatureFlagsClientProvider flags={flags}>
            {children}
        </FeatureFlagsClientProvider>
    );
}
