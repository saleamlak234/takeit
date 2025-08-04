// Timezone utility functions for handling user's local timezone
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getCurrentLocalTime = (): Date => {
  return new Date();
};

export const isWithinTimeWindow = (startHour: number, endHour: number): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  return currentHour >= startHour && currentHour <= endHour;
};

export const getNextMidnight = (): Date => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight;
};

export const formatTimeInTimezone = (date: Date, timezone?: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone || getUserTimezone(),
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const getTimeUntilNextMidnight = (): number => {
  const now = new Date();
  const midnight = getNextMidnight();
  return midnight.getTime() - now.getTime();
};

export const isWithdrawalTimeActive = (): boolean => {
  return isWithinTimeWindow(10, 17); // 10:00 AM to 5:00 PM
};

export const getWithdrawalTimeStatus = (): {
  isActive: boolean;
  message: string;
  nextAvailable?: string;
} => {
  const isActive = isWithdrawalTimeActive();
  const now = new Date();
  
  if (isActive) {
    const endTime = new Date(now);
    endTime.setHours(17, 0, 0, 0);
    return {
      isActive: true,
      message: `Withdrawals available until ${formatTimeInTimezone(endTime)}`
    };
  }
  
  const nextStart = new Date(now);
  if (now.getHours() >= 17) {
    // After 5 PM, next availability is tomorrow at 10 AM
    nextStart.setDate(nextStart.getDate() + 1);
  }
  nextStart.setHours(10, 0, 0, 0);
  
  return {
    isActive: false,
    message: `Withdrawals available from 10:00 AM - 5:00 PM`,
    nextAvailable: formatTimeInTimezone(nextStart)
  };
};