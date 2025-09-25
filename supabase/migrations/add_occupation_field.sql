-- Add occupation field to patients table
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Add comment for documentation
COMMENT ON COLUMN patients.occupation IS 'Ocupación o profesión del paciente';
