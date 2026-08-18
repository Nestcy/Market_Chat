import React from "react";
import { Loader2 } from "lucide-react";
import { useInFlightMessage } from "@/hooks/use-in-flight-status";
import { cn } from "@/lib/utils";

type InFlightStatusProps = {
  isActive: boolean;
  fallback?: React.ReactNode;
  icon?: React.ReactNode;
  showSpinner?: boolean;
  spinnerClassName?: string;
  className?: string;
};

/**
 * Reusable component for displaying in-flight rotating status messages alongside a spinner.
 */
export function InFlightStatus({
  isActive,
  fallback,
  icon,
  showSpinner = true,
  spinnerClassName = "size-3.5 animate-spin",
  className,
}: InFlightStatusProps) {
  const message = useInFlightMessage(isActive);

  if (!isActive) {
    return <>{fallback ?? null}</>;
  }

  const iconNode = showSpinner ? (
    <Loader2 className={cn("shrink-0", spinnerClassName)} />
  ) : (
    (icon ?? null)
  );

  return (
    <span className={cn("inline-flex items-center gap-1.5 transition-all duration-300", className)}>
      {iconNode}
      <span className="truncate">{message}</span>
    </span>
  );
}
