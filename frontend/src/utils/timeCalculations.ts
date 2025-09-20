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