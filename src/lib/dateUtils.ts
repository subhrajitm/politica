/**
 * Utility functions for date handling and validation
 */

/**
 * Normalizes a date string to a valid PostgreSQL DATE format (YYYY-MM-DD)
 * Handles various input formats and returns a safe default if invalid
 */
export function normalizeDate(dateString: string | undefined | null): string {
  if (!dateString || typeof dateString !== 'string') {
    return '1970-01-01'; // Safe default
  }

  const trimmed = dateString.trim();
  
  // Handle empty strings
  if (!trimmed) {
    return '1970-01-01';
  }

  // Already in correct format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle YYYY-MM format (add day 01)
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }

  // Handle month name formats
  const monthMap: Record<string, string> = {
    'january': '01', 'jan': '01',
    'february': '02', 'feb': '02',
    'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'may': '05',
    'june': '06', 'jun': '06',
    'july': '07', 'jul': '07',
    'august': '08', 'aug': '08',
    'september': '09', 'sep': '09', 'sept': '09',
    'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'december': '12', 'dec': '12'
  };

  // Handle "Month YYYY" format (e.g., "May 2019")
  const monthYearMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch;
    const monthNum = monthMap[month.toLowerCase()];
    if (monthNum && year.length === 4) {
      return `${year}-${monthNum}-01`;
    }
  }

  // Handle "YYYY Month" format (e.g., "2019 May")
  const yearMonthMatch = trimmed.match(/^(\d{4})\s+([a-zA-Z]+)$/);
  if (yearMonthMatch) {
    const [, year, month] = yearMonthMatch;
    const monthNum = monthMap[month.toLowerCase()];
    if (monthNum && year.length === 4) {
      return `${year}-${monthNum}-01`;
    }
  }

  // Handle "Month DD, YYYY" format (e.g., "May 15, 2019")
  const monthDayYearMatch = trimmed.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monthDayYearMatch) {
    const [, month, day, year] = monthDayYearMatch;
    const monthNum = monthMap[month.toLowerCase()];
    if (monthNum && year.length === 4) {
      const paddedDay = day.padStart(2, '0');
      return `${year}-${monthNum}-${paddedDay}`;
    }
  }

  // Handle "DD Month YYYY" format (e.g., "15 May 2019")
  const dayMonthYearMatch = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
  if (dayMonthYearMatch) {
    const [, day, month, year] = dayMonthYearMatch;
    const monthNum = monthMap[month.toLowerCase()];
    if (monthNum && year.length === 4) {
      const paddedDay = day.padStart(2, '0');
      return `${year}-${monthNum}-${paddedDay}`;
    }
  }

  // Handle MM/DD/YYYY format
  const mmddyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch;
    if (year.length === 4) {
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  }

  // Handle DD/MM/YYYY format
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
    if (year.length === 4) {
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  }

  // Try to parse as a Date object
  try {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    }
  } catch (error) {
    // Ignore parsing errors
  }

  // If all else fails, return safe default
  console.warn(`Could not parse date: "${trimmed}", using default`);
  return '1970-01-01';
}

/**
 * Validates if a date string is in valid PostgreSQL DATE format
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  // Check format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === dateString;
}

/**
 * Normalizes assumed office date specifically for month inputs
 */
export function normalizeAssumedOffice(dateString: string | undefined | null): string {
  if (!dateString || typeof dateString !== 'string') {
    return '1970-01-01';
  }

  const trimmed = dateString.trim();
  
  // If it's already in YYYY-MM format, add -01
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }

  // Otherwise, use the general normalize function
  return normalizeDate(trimmed);
}

/**
 * Converts a date string to YYYY-MM format for month inputs
 */
export function dateToMonthFormat(dateString: string | undefined | null): string {
  if (!dateString || typeof dateString !== 'string') {
    return '';
  }

  const trimmed = dateString.trim();
  
  // If it's already in YYYY-MM format, return as is
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // If it's in YYYY-MM-DD format, extract YYYY-MM
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed.substring(0, 7); // Returns YYYY-MM
  }

  // Try to normalize and then convert
  const normalized = normalizeDate(trimmed);
  if (normalized && normalized !== '1970-01-01') {
    return normalized.substring(0, 7); // Returns YYYY-MM
  }

  return '';
}

/**
 * Converts a month format (YYYY-MM) to full date format (YYYY-MM-DD)
 */
export function monthToDateFormat(monthString: string | undefined | null): string {
  if (!monthString || typeof monthString !== 'string') {
    return '1970-01-01';
  }

  const trimmed = monthString.trim();
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // If it's in YYYY-MM format, add -01
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return `${trimmed}-01`;
  }

  return '1970-01-01';
}
