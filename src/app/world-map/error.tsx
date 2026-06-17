"use client";

import { ErrorFallback } from "@/components/error-fallback";

export default function WorldMapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Failed to Load World Map"
      message="The Frontend Realms are currently unreachable. Please try again."
    />
  );
}
