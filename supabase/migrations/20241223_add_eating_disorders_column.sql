-- Add eating_disorders column to clinical_history table
ALTER TABLE clinical_history
ADD COLUMN eating_disorders TEXT;

-- Add comment for documentation
COMMENT ON COLUMN clinical_history.eating_disorders IS 'Trastornos alimentarios y psicológicos (JSON array)';