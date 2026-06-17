"use client";

import { ErrorFallback } from "@/components/error-fallback";

export default function ProfileError({
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
      title="Failed to Load Profile"
      message="Your player data could not be loaded. Please try again."
    />
  );
}
