import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

/**
 * Calculate the next due date for a PM schedule based on frequency settings
 * @param startDate - The start date of the schedule
 * @param frequencyType - The type of frequency (daily, weekly, monthly, etc.)
 * @param frequencyValue - The interval value (e.g., every 2 weeks)
 * @returns The calculated next due date
 */
export function calculateNextDueDate(
  startDate: Date | string,
  frequencyType: string,
  frequencyValue: number
): Date {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  
  switch (frequencyType.toLowerCase()) {
    case 'daily':
      return addDays(start, frequencyValue);
    case 'weekly':
      return addWeeks(start, frequencyValue);
    case 'monthly':
      return addMonths(start, frequencyValue);
    case 'quarterly':
      return addMonths(start, frequencyValue * 3);
    case 'yearly':
    case 'annual':
      return addYears(start, frequencyValue);
    case 'custom':
      // For custom, default to days
      return addDays(start, frequencyValue);
    default:
      // Default to monthly if unknown
      return addMonths(start, frequencyValue || 1);
  }
}

/**
 * Calculate the next occurrence after completion
 * @param lastCompletedDate - The date when the schedule was last completed
 * @param frequencyType - The type of frequency
 * @param frequencyValue - The interval value
 * @returns The calculated next due date
 */
export function calculateNextOccurrence(
  lastCompletedDate: Date | string,
  frequencyType: string,
  frequencyValue: number
): Date {
  return calculateNextDueDate(lastCompletedDate, frequencyType, frequencyValue);
}
