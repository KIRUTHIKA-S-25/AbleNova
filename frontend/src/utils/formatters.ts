/**
 * Format a percentage for display and screen readers
 */
export function formatPercentage(value: number, total: number = 100): string {
  if (total === 0) return '0%';
  const percentage = Math.round((value / total) * 100);
  return `${percentage}%`;
}

/**
 * Format time in seconds to accessible text (e.g., "5 minutes 30 seconds")
 */
export function formatAccessibleDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) {
    return `${mins} minute${mins === 1 ? '' : 's'}`;
  }
  return `${mins} minute${mins === 1 ? '' : 's'} ${secs} second${secs === 1 ? '' : 's'}`;
}

/**
 * Format date into an accessible, human-readable string
 */
export function formatAccessibleDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}
