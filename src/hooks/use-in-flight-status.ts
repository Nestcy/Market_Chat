import { useEffect, useState } from "react";

export const IN_FLIGHT_MESSAGES = [
  "Thinking through the strategy...",
  "Reviewing the content pillars...",
  "Cross-checking the research...",
  "Drafting the angle...",
  "Refining the tone...",
  "Weighing a few directions...",
  "Almost there...",
] as const;

/**
 * Cycles through the masked wait message pool every 4.5 seconds
 * for as long as an in-flight request is pending.
 */
export function useInFlightMessage(isActive: boolean, intervalMs = 4500): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setIndex(0);
      return;
    }

    setIndex(0);
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % IN_FLIGHT_MESSAGES.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isActive, intervalMs]);

  return IN_FLIGHT_MESSAGES[index] ?? IN_FLIGHT_MESSAGES[0];
}
