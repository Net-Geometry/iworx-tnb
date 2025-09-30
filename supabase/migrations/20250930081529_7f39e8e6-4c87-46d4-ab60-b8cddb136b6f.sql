-- Update existing PM schedules to calculate and populate next_due_date
-- This migration fixes schedules that have null next_due_date values

UPDATE pm_schedules
SET next_due_date = CASE
  WHEN frequency_type = 'daily' THEN start_date + (frequency_value || ' days')::interval
  WHEN frequency_type = 'weekly' THEN start_date + (frequency_value || ' weeks')::interval
  WHEN frequency_type = 'monthly' THEN start_date + (frequency_value || ' months')::interval
  WHEN frequency_type = 'quarterly' THEN start_date + ((frequency_value * 3) || ' months')::interval
  WHEN frequency_type = 'yearly' THEN start_date + (frequency_value || ' years')::interval
  WHEN frequency_type = 'custom' THEN start_date + (frequency_value || ' days')::interval
  ELSE start_date + (frequency_value || ' months')::interval
END
WHERE next_due_date IS NULL AND start_date IS NOT NULL;