"use client";

import * as React from "react";
import type { z } from "zod";

const FeatureFlagsContext = React.createContext<Record<string, unknown> | null>(
    null,
);

export interface FeatureFlagsClientProviderProps {
    /** `null` when the nearest `FeatureFlagsProvider` could not resolve its flags (fetch failure or schema mismatch). */
    flags: Record<string, unknown> | null;
    children: React.ReactNode;
}

/**
 * Internal client boundary. React Server Components cannot render a
 * Context Provider, so `FeatureFlagsProvider` (an async Server Component)
 * renders this Client Component and passes it the already-validated,
 * plain-JSON-serializable flags object as a prop.
 */
export function FeatureFlagsClientProvider({
    flags,
    children,
}: FeatureFlagsClientProviderProps) {
    const value = React.useMemo(() => flags, [flags]);
    return (
        <FeatureFlagsContext.Provider value={value}>
            {children}
        </FeatureFlagsContext.Provider>
    );
}

/**
 * Returns the feature flags supplied by the nearest `FeatureFlagsProvider`,
 * typed via the zod schema type passed as `TSchema`. Returns `null` when
 * rendered outside a `FeatureFlagsProvider`, or when that provider could
 * not resolve its flags (Edge Config fetch failure or schema mismatch) —
 * callers decide their own fallback behavior rather than the hook throwing.
 *
 * @example
 * const flags = useFeatureFlags<typeof appFlagsSchema>();
 */
export function useFeatureFlags<
    TSchema extends z.ZodType,
>(): z.infer<TSchema> | null {
    const ctx = React.useContext(FeatureFlagsContext);
    return ctx as z.infer<TSchema> | null;
}
