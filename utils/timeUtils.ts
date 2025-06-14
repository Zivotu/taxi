
import { Shift } from '../types';

/**
 * Parses a time string (HH:MM) into hours and minutes.
 * @param timeStr The time string in HH:MM format.
 * @returns An object with hours and minutes, or null if format is invalid.
 */
export const parseTime = (timeStr: string): { hours: number, minutes: number } | null => {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) {
    return null;
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return { hours, minutes };
};

/**
 * Calculates the duration of a single shift in hours.
 * Assumes shifts are within the same calendar day.
 * @param startTimeStr Start time in HH:MM format.
 * @param endTimeStr End time in HH:MM format.
 * @returns Duration in hours, or 0 if times are invalid or end time is before start time.
 */
export const calculateShiftDuration = (startTimeStr: string, endTimeStr: string): number => {
  const startTime = parseTime(startTimeStr);
  const endTime = parseTime(endTimeStr);

  if (!startTime || !endTime) {
    return 0; // Invalid time format
  }

  const startTotalMinutes = startTime.hours * 60 + startTime.minutes;
  const endTotalMinutes = endTime.hours * 60 + endTime.minutes;

  if (endTotalMinutes < startTotalMinutes) {
    // This simple model assumes shifts end on the same day.
    // For shifts crossing midnight, a more complex logic or date context would be needed.
    // For now, consider this an invalid shift or a zero-duration shift for this day.
    return 0; 
  }

  return (endTotalMinutes - startTotalMinutes) / 60;
};

/**
 * Calculates the total work hours from an array of shifts.
 * @param shifts Array of Shift objects.
 * @returns Total work hours.
 */
export const calculateTotalWorkHours = (shifts: Shift[]): number => {
  if (!shifts || shifts.length === 0) {
    return 0;
  }
  return shifts.reduce((total, shift) => {
    return total + calculateShiftDuration(shift.startTime, shift.endTime);
  }, 0);
};
