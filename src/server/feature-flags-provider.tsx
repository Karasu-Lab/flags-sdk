import type { Flag } from "flags/next";
import { evaluate } from "flags/next";
import type { ReactNode } from "react";
import type { z } from "zod";
import { FeatureFlagsClientProvider } from "../client/feature-flags-context";

export interface FeatureFlagsProviderProps<TSchema extends z.ZodType> {
    /**
     * Flag declarations (from `flag()`), keyed to match `schema`'s shape.
     * Declared once at module scope in the consuming app (e.g. `src/lib/flags.ts`).
     */
    flags: { [K in keyof z.infer<TSchema>]: Flag<z.infer<TSchema>[K]> };
    /** Zod schema validating the evaluated flag values. */
    schema: TSchema;
    children: ReactNode;
}

/**
 * Evaluates the given flag declarations in a single batched `evaluate()`
 * call and validates the result against `schema` on every render. When
 * evaluation fails or the result does not match `schema`, the flags could
 * not be resolved — `useFeatureFlags()` returns `null` in that case rather
 * than throwing.
 */
export async function FeatureFlagsProvider<TSchema extends z.ZodType>({
    flags: flagDeclarations,
    schema,
    children,
}: FeatureFlagsProviderProps<TSchema>) {
    let flags: Record<string, unknown> | null;
    try {
        const values = await evaluate(flagDeclarations);
        flags = schema.parse(values) as Record<string, unknown>;
    } catch {
        flags = null;
    }
    return (
        <FeatureFlagsClientProvider flags={flags}>
            {children}
        </FeatureFlagsClientProvider>
    );
}
