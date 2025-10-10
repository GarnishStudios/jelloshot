export function parseTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTimeTo12Hour(timeString: string): string {
  if (!timeString) return '--:--';

  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function addMinutes(date: Date, minutes: number): Date {
  const newDate = new Date(date);
  newDate.setMinutes(newDate.getMinutes() + minutes);
  return newDate;
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const start = parseTime(startTime);
  const end = addMinutes(start, durationMinutes);
  return formatTime(end);
}

export function calculateTotalDuration(items: { shot_duration: number }[]): number {
  return items.reduce((total, item) => total + item.shot_duration, 0);
}

export function recalculateStartTimes<T extends { shot_duration: number; order_index: number }>(
  items: T[],
  callTime: string
): (T & { start_time: string })[] {
  let currentTime = parseTime(callTime);

  return items
    .sort((a, b) => a.order_index - b.order_index)
    .map((item, index) => {
      const startTime = formatTime(currentTime);
      currentTime = addMinutes(currentTime, item.shot_duration);

      return {
        ...item,
        start_time: startTime,
        order_index: index
      };
    });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}min`;
  }
}

export function getTimeDifferenceMinutes(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

export function recalculateStartTimesWithBoundaries<T extends { shot_duration: number; order_index: number; duration_locked?: boolean; id: string }>(
  items: T[],
  startTime: string,
  endTime: string
): (T & { start_time: string; shot_duration: number })[] {
  if (items.length === 0) return [];

  const sortedItems = items.sort((a, b) => a.order_index - b.order_index);
  const totalAvailableMinutes = getTimeDifferenceMinutes(startTime, endTime);

  if (totalAvailableMinutes <= 0) {
    // If no time available, return items with start time and minimal duration
    return sortedItems.map((item, index) => ({
      ...item,
      start_time: startTime,
      shot_duration: 1,
      order_index: index
    }));
  }

  // Separate locked and unlocked shots
  const lockedShots = sortedItems.filter(item => item.duration_locked);
  const unlockedShots = sortedItems.filter(item => !item.duration_locked);

  // Calculate time used by locked shots
  const timeUsedByLockedShots = lockedShots.reduce((total, item) => total + item.shot_duration, 0);

  // Calculate remaining time for unlocked shots
  const remainingTime = Math.max(0, totalAvailableMinutes - timeUsedByLockedShots);

  // If there are unlocked shots, distribute remaining time among them
  const unlockedShotsCount = unlockedShots.length;
  const adjustedDurations: Map<string, number> = new Map();

  // Set durations for locked shots (keep unchanged)
  lockedShots.forEach(item => {
    adjustedDurations.set(item.id, item.shot_duration);
  });

  // Distribute remaining time among unlocked shots
  if (unlockedShotsCount > 0) {
    const baseTimePerUnlockedShot = Math.max(1, Math.floor(remainingTime / unlockedShotsCount));
    const remainderTime = remainingTime % unlockedShotsCount;

    unlockedShots.forEach((item, index) => {
      const extraMinute = index < remainderTime ? 1 : 0;
      adjustedDurations.set(item.id, baseTimePerUnlockedShot + extraMinute);
    });
  }

  // Calculate start times based on final durations in order
  let currentTime = parseTime(startTime);
  const results: (T & { start_time: string; shot_duration: number })[] = [];

  sortedItems.forEach((item, index) => {
    const startTimeStr = formatTime(currentTime);
    const finalDuration = adjustedDurations.get(item.id) || item.shot_duration;

    results.push({
      ...item,
      start_time: startTimeStr,
      shot_duration: finalDuration,
      order_index: index
    });

    // Move to next shot's start time
    currentTime = addMinutes(currentTime, finalDuration);
  });

  return results;
}

export function recalculateWithManualDuration<T extends { shot_duration: number; order_index: number; id: string }>(
  items: T[],
  changedItemId: string,
  newDuration: number,
  startTime: string,
  endTime: string
): (T & { start_time: string; shot_duration: number })[] {
  if (items.length === 0) return [];

  const sortedItems = items.sort((a, b) => a.order_index - b.order_index);
  const totalAvailableMinutes = getTimeDifferenceMinutes(startTime, endTime);

  if (totalAvailableMinutes <= 0) {
    return sortedItems.map((item, index) => ({
      ...item,
      start_time: startTime,
      shot_duration: 1,
      order_index: index
    }));
  }

  // Find the item that was manually changed
  const changedItemIndex = sortedItems.findIndex(item => item.id === changedItemId);

  if (changedItemIndex === -1) {
    // If the changed item isn't found, fall back to regular distribution
    return recalculateStartTimesWithBoundaries(items, startTime, endTime);
  }

  // Ensure the new duration doesn't exceed total available time
  const maxAllowedDuration = Math.max(1, totalAvailableMinutes - (sortedItems.length - 1)); // Leave at least 1 minute for other shots
  const constrainedNewDuration = Math.min(newDuration, maxAllowedDuration);

  // Calculate remaining time after the manually set duration
  const remainingTime = totalAvailableMinutes - constrainedNewDuration;
  const otherItemsCount = sortedItems.length - 1;

  // If there are other items, distribute remaining time among them
  const otherItemDurations: number[] = [];
  if (otherItemsCount > 0) {
    const baseTimePerOtherShot = Math.floor(remainingTime / otherItemsCount);
    const remainderTime = remainingTime % otherItemsCount;

    for (let i = 0; i < otherItemsCount; i++) {
      const extraMinute = i < remainderTime ? 1 : 0;
      otherItemDurations.push(Math.max(1, baseTimePerOtherShot + extraMinute));
    }
  }

  // Build the final duration array
  const finalDurations: number[] = [];
  let otherItemIndex = 0;

  sortedItems.forEach((item) => {
    if (item.id === changedItemId) {
      finalDurations.push(constrainedNewDuration);
    } else {
      finalDurations.push(otherItemDurations[otherItemIndex] || 1);
      otherItemIndex++;
    }
  });

  // Calculate start times based on final durations
  let currentTime = parseTime(startTime);
  const results: (T & { start_time: string; shot_duration: number })[] = [];

  sortedItems.forEach((item, index) => {
    const startTimeStr = formatTime(currentTime);
    const duration = finalDurations[index];

    results.push({
      ...item,
      start_time: startTimeStr,
      shot_duration: duration,
      order_index: index
    });

    currentTime = addMinutes(currentTime, duration);
  });

  return results;
}

export function recalculateWithLastShotAdjustment<T extends { shot_duration: number; order_index: number; id: string }>(
  items: T[],
  changedItemId: string,
  newDuration: number,
  startTime: string,
  endTime: string
): (T & { start_time: string; shot_duration: number })[] {
  if (items.length === 0) return [];

  const sortedItems = items.sort((a, b) => a.order_index - b.order_index);
  const totalAvailableMinutes = getTimeDifferenceMinutes(startTime, endTime);

  if (totalAvailableMinutes <= 0) {
    return sortedItems.map((item, index) => ({
      ...item,
      start_time: startTime,
      shot_duration: 1,
      order_index: index
    }));
  }

  // Find the item that was manually changed
  const changedItemIndex = sortedItems.findIndex(item => item.id === changedItemId);

  if (changedItemIndex === -1) {
    // If the changed item isn't found, fall back to regular distribution
    return recalculateStartTimesWithBoundaries(items, startTime, endTime);
  }

  // Update the changed item's duration
  const updatedItems = sortedItems.map(item =>
    item.id === changedItemId ? { ...item, shot_duration: newDuration } : item
  );

  // Calculate total duration of all shots except the last one
  const allExceptLast = updatedItems.slice(0, -1);
  const totalUsedTime = allExceptLast.reduce((total, item) => total + item.shot_duration, 0);

  // Calculate remaining time for the last shot
  const remainingTime = Math.max(1, totalAvailableMinutes - totalUsedTime);

  // Update the last shot's duration to fill remaining time
  const finalItems = updatedItems.map((item, index) =>
    index === updatedItems.length - 1
      ? { ...item, shot_duration: remainingTime }
      : item
  );

  // Calculate start times based on final durations
  let currentTime = parseTime(startTime);
  const results: (T & { start_time: string; shot_duration: number })[] = [];

  finalItems.forEach((item, index) => {
    const startTimeStr = formatTime(currentTime);

    results.push({
      ...item,
      start_time: startTimeStr,
      shot_duration: item.shot_duration,
      order_index: index
    });

    currentTime = addMinutes(currentTime, item.shot_duration);
  });

  return results;
}

export function recalculateWithShotBelowDistribution<T extends { shot_duration: number; order_index: number; id: string; duration_locked?: boolean }>(
  items: T[],
  changedItemId: string,
  newDuration: number,
  startTime: string,
  endTime: string
): (T & { start_time: string; shot_duration: number })[] {
  if (items.length === 0) return [];

  const sortedItems = items.sort((a, b) => a.order_index - b.order_index);
  const totalAvailableMinutes = getTimeDifferenceMinutes(startTime, endTime);

  if (totalAvailableMinutes <= 0) {
    return sortedItems.map((item, index) => ({
      ...item,
      start_time: startTime,
      shot_duration: 1,
      order_index: index
    }));
  }

  // Find the item that was manually changed
  const changedItemIndex = sortedItems.findIndex(item => item.id === changedItemId);

  if (changedItemIndex === -1) {
    // If the changed item isn't found, fall back to regular distribution
    return recalculateStartTimesWithBoundaries(items, startTime, endTime);
  }

  // Split into shots above, the changed shot, and shots below
  const shotsAbove = sortedItems.slice(0, changedItemIndex);
  const changedShot = sortedItems[changedItemIndex];
  const shotsBelow = sortedItems.slice(changedItemIndex + 1);

  // Calculate time used by shots above (keep their durations unchanged)
  const timeUsedAbove = shotsAbove.reduce((total, item) => total + item.shot_duration, 0);

  // Add the new duration for the changed shot
  const timeUsedUpToChanged = timeUsedAbove + newDuration;

  // Calculate time used by locked shots below
  const lockedShotsBelow = shotsBelow.filter(item => item.duration_locked);
  const unlockedShotsBelow = shotsBelow.filter(item => !item.duration_locked);
  const timeUsedByLockedShots = lockedShotsBelow.reduce((total, item) => total + item.shot_duration, 0);

  // Calculate remaining time for unlocked shots below
  const remainingTime = totalAvailableMinutes - timeUsedUpToChanged - timeUsedByLockedShots;

  // Distribute remaining time evenly among unlocked shots below
  const unlockedShotsBelowCount = unlockedShotsBelow.length;
  let distributedShotsBelow = shotsBelow;

  if (unlockedShotsBelowCount > 0 && remainingTime > 0) {
    const timePerUnlockedShot = Math.max(1, Math.floor(remainingTime / unlockedShotsBelowCount));
    const extraTime = remainingTime % unlockedShotsBelowCount;

    distributedShotsBelow = shotsBelow.map((item, _index) => {
      if (item.duration_locked) {
        // Keep locked duration unchanged
        return item;
      } else {
        // Distribute time among unlocked shots
        const unlockedIndex = unlockedShotsBelow.findIndex(unlocked => unlocked.id === item.id);
        return {
          ...item,
          shot_duration: timePerUnlockedShot + (unlockedIndex < extraTime ? 1 : 0)
        };
      }
    });
  } else if (unlockedShotsBelowCount > 0) {
    // If no time remaining, give each unlocked shot below 1 minute
    distributedShotsBelow = shotsBelow.map(item => ({
      ...item,
      shot_duration: item.duration_locked ? item.shot_duration : 1
    }));
  }

  // Combine all shots with updated durations
  const finalItems = [
    ...shotsAbove, // Keep original durations
    { ...changedShot, shot_duration: newDuration }, // Changed shot
    ...distributedShotsBelow // Redistributed shots below
  ];

  // Calculate start times based on final durations
  let currentTime = parseTime(startTime);
  const results: (T & { start_time: string; shot_duration: number })[] = [];

  finalItems.forEach((item, index) => {
    const startTimeStr = formatTime(currentTime);

    results.push({
      ...item,
      start_time: startTimeStr,
      shot_duration: item.shot_duration,
      order_index: index
    });

    currentTime = addMinutes(currentTime, item.shot_duration);
  });

  return results;
}