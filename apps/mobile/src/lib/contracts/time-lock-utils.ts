import type { UnlockCountdown } from "../../types";

export const getUnlockTimestampMs = (unlockDate: string) => Date.parse(unlockDate);

export const buildUnlockCountdown = ({
  unlockDate,
  nowMs = Date.now(),
}: {
  unlockDate: string;
  nowMs?: number;
}): UnlockCountdown => {
  const unlockTimestampMs = getUnlockTimestampMs(unlockDate);
  const remainingMs = Math.max(unlockTimestampMs - nowMs, 0);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalMs: remainingMs,
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    isComplete: remainingMs <= 0,
  };
};

export const formatCountdownParts = (countdown: UnlockCountdown) => {
  if (countdown.days > 0) {
    return [
      { unit: "days" as const, value: countdown.days },
      { unit: "hours" as const, value: countdown.hours },
    ];
  }

  if (countdown.hours > 0) {
    return [
      { unit: "hours" as const, value: countdown.hours },
      { unit: "minutes" as const, value: countdown.minutes },
    ];
  }

  if (countdown.minutes > 0) {
    return [
      { unit: "minutes" as const, value: countdown.minutes },
      { unit: "seconds" as const, value: countdown.seconds },
    ];
  }

  return [{ unit: "seconds" as const, value: countdown.seconds }];
};
