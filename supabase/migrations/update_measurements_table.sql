-- Update measurements table with new fields

-- Add new measurement fields
ALTER TABLE measurements 
ADD COLUMN IF NOT EXISTS water_percentage DECIMAL(5,2);

ALTER TABLE measurements 
ADD COLUMN IF NOT EXISTS physical_rating INTEGER;

ALTER TABLE measurements 
ADD COLUMN IF NOT EXISTS calories_needed INTEGER;

ALTER TABLE measurements 
ADD COLUMN IF NOT EXISTS metabolic_age INTEGER;

ALTER TABLE measurements 
ADD COLUMN IF NOT EXISTS bone_mass DECIMAL(5,2);

ALTER TABLE measurements 
ADD COLUMN IF NOT EXISTS visceral_fat INTEGER;

ALTER TABLE measurements 
ADD COLUMN IF NOT EXISTS is_initial_measurement BOOLEAN DEFAULT FALSE;

-- Add index for measurement date if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_measurements_date ON measurements(measurement_date);

-- Add comments to clarify field purposes
COMMENT ON COLUMN measurements.weight IS 'Peso en kg';
COMMENT ON COLUMN measurements.body_fat_percentage IS 'Grasa corporal en %';
COMMENT ON COLUMN measurements.water_percentage IS 'Agua corporal en %';
COMMENT ON COLUMN measurements.muscle_mass IS 'Músculo en kg';
COMMENT ON COLUMN measurements.physical_rating IS 'Valoración física (1-9)';
COMMENT ON COLUMN measurements.calories_needed IS 'Calorías necesarias por día';
COMMENT ON COLUMN measurements.metabolic_age IS 'Edad metabólica en años';
COMMENT ON COLUMN measurements.bone_mass IS 'Masa ósea en kg';
COMMENT ON COLUMN measurements.visceral_fat IS 'Grasa visceral (1-59)';
COMMENT ON COLUMN measurements.is_initial_measurement IS 'Marca si es la medición inicial al crear paciente';