-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  phone_country_code VARCHAR(5) DEFAULT '+502', -- Default to Guatemala
  date_of_birth DATE,
  gender VARCHAR(20),
  height DECIMAL(5,2), -- in cm
  weight DECIMAL(5,2), -- in kg
  goal TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  notes TEXT,
  disliked_foods TEXT, -- JSON array of foods the patient doesn't like
  avatar_url TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster queries
CREATE INDEX idx_patients_nutritionist ON patients(nutritionist_id);
CREATE INDEX idx_patients_status ON patients(status);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policies for patients table
CREATE POLICY "Users can view their own patients" ON patients
  FOR SELECT USING (auth.uid() = nutritionist_id);

CREATE POLICY "Users can insert their own patients" ON patients
  FOR INSERT WITH CHECK (auth.uid() = nutritionist_id);

CREATE POLICY "Users can update their own patients" ON patients
  FOR UPDATE USING (auth.uid() = nutritionist_id);

CREATE POLICY "Users can delete their own patients" ON patients
  FOR DELETE USING (auth.uid() = nutritionist_id);

-- Create measurements table for tracking patient progress
CREATE TABLE IF NOT EXISTS measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  weight DECIMAL(5,2), -- Peso en kg
  body_fat_percentage DECIMAL(5,2), -- Grasa corporal en %
  water_percentage DECIMAL(5,2), -- Agua corporal en %
  muscle_mass DECIMAL(5,2), -- Músculo en kg
  physical_rating INTEGER, -- Valoración física (1-9)
  calories_needed INTEGER, -- Calorías necesarias por día
  metabolic_age INTEGER, -- Edad metabólica en años
  bone_mass DECIMAL(5,2), -- Masa ósea en kg
  visceral_fat INTEGER, -- Grasa visceral (1-59)
  waist_circumference DECIMAL(5,2),
  hip_circumference DECIMAL(5,2),
  chest_circumference DECIMAL(5,2),
  arm_circumference DECIMAL(5,2),
  thigh_circumference DECIMAL(5,2),
  notes TEXT,
  measurement_date DATE NOT NULL,
  is_initial_measurement BOOLEAN DEFAULT FALSE, -- Marca si es la medición inicial al crear paciente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for measurements
CREATE INDEX idx_measurements_patient ON measurements(patient_id);
CREATE INDEX idx_measurements_date ON measurements(measurement_date);

-- Enable Row Level Security for measurements
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- Create policies for measurements table
CREATE POLICY "Users can view measurements of their patients" ON measurements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM patients 
      WHERE patients.id = measurements.patient_id 
      AND patients.nutritionist_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert measurements for their patients" ON measurements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients 
      WHERE patients.id = measurements.patient_id 
      AND patients.nutritionist_id = auth.uid()
    )
  );

CREATE POLICY "Users can update measurements of their patients" ON measurements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM patients 
      WHERE patients.id = measurements.patient_id 
      AND patients.nutritionist_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete measurements of their patients" ON measurements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM patients 
      WHERE patients.id = measurements.patient_id 
      AND patients.nutritionist_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on patients table
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();