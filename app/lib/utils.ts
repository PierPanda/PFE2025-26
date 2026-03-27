/**
 * Merge CSS class names
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

/**
 * Capitalize the first character of a string
 */
export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Format price for display
 */
export function formatPrice(price: string | number, currency = 'EUR'): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(numPrice);
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h${remainingMinutes}`;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if we're running on the server
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if we're running on the client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Format time from Date or string to HH:mm format
 */
export function formatTime(time: Date | string): string {
  const date = typeof time === 'string' ? new Date(time) : time;
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Build a stable YYYY-MM-DD key from a date
 */
export function getDateKey(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format a date using fr-FR locale and capitalize the result
 */
export function formatDateLabel(date: Date | string, options: Intl.DateTimeFormatOptions): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return capitalize(new Intl.DateTimeFormat('fr-FR', options).format(parsedDate));
}

/**
 * Format a date and time in fr-FR locale, e.g. Mardi 18 mars 2026 à 10h00
 */
export function formatDateTime(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const dateLabel = formatDateLabel(parsedDate, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `${dateLabel} à ${formatHourLabel(parsedDate)}`;
}

/**
 * Format time to Hhmm, e.g. 9h00
 */
export function formatHourLabel(time: Date | string): string {
  const [hours, minutes] = formatTime(time).split(':');
  return `${Number(hours)}h${minutes}`;
}

/**
 * Calculate average rating from a list of ratings
 * Returns null if no ratings exist
 */
export function calculateAverageRating(ratings: { rate: string | number }[]): number | null {
  if (ratings.length === 0) return null;
  return ratings.reduce((sum, r) => sum + Number(r.rate), 0) / ratings.length;
}

/**
 * Format a time slot for display, e.g. "Lun 01/01 - 14:00 à 15:00"
 */
export function formatSlot(start: Date, end: Date) {
  const date = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(start);

  const startTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(start);

  const endTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(end);

  return `${date} - ${startTime} a ${endTime}`;
}
