-- Create clinical history table (separate from patients)
CREATE TABLE IF NOT EXISTS clinical_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE UNIQUE,
  
  -- 1. Antecedentes Heredofamiliares (JSON dinámico)
  family_history TEXT, -- JSON array of family history items
  
  -- 1.2 Antecedentes Personales Patológicos (JSON dinámico)
  personal_pathological_history TEXT, -- JSON array of personal diseases
  
  -- 2.1 Actividad Física (JSON dinámico)
  physical_activities TEXT, -- JSON array of physical activities
  
  -- 2.2 Toxicomanías (JSON dinámico)
  toxicomanias TEXT, -- JSON array of substance use
  
  -- 3. Trastornos Gastrointestinales (JSON dinámico)
  gastrointestinal_disorders TEXT, -- JSON array of GI disorders
  
  -- 4. Antecedentes Gineco-obstétricos
  gyneco_obstetric_history TEXT, -- JSON object with gyneco-obstetric data
  
  -- 5. Hábitos de Alimentación
  eating_habits TEXT, -- JSON object with all eating habits sections
  
  -- 6. Frecuencia de Consumo de Alimentos
  food_frequency TEXT, -- JSON object with food group frequencies
  
  -- 7. Recordatorio de 24 Horas
  food_recall_24h TEXT, -- JSON object with 24h food recall
  
  -- 8. Indicadores Bioquímicos
  biochemical_indicators TEXT, -- JSON array of lab results
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for patient lookup
CREATE INDEX idx_clinical_history_patient ON clinical_history(patient_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_clinical_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_clinical_history_updated_at
  BEFORE UPDATE ON clinical_history
  FOR EACH ROW
  EXECUTE FUNCTION update_clinical_history_updated_at();

-- Enable Row Level Security
ALTER TABLE clinical_history ENABLE ROW LEVEL SECURITY;

-- Create policies for clinical_history table
CREATE POLICY "Users can view their patients' clinical history" ON clinical_history
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE nutritionist_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert clinical history for their patients" ON clinical_history
  FOR INSERT WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE nutritionist_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their patients' clinical history" ON clinical_history
  FOR UPDATE USING (
    patient_id IN (
      SELECT id FROM patients WHERE nutritionist_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their patients' clinical history" ON clinical_history
  FOR DELETE USING (
    patient_id IN (
      SELECT id FROM patients WHERE nutritionist_id = auth.uid()
    )
  );

-- Comments for documentation
COMMENT ON TABLE clinical_history IS 'Historial clínico completo de pacientes';
COMMENT ON COLUMN clinical_history.family_history IS 'Antecedentes heredofamiliares (JSON array)';
COMMENT ON COLUMN clinical_history.personal_pathological_history IS 'Antecedentes personales patológicos (JSON array)';
COMMENT ON COLUMN clinical_history.physical_activities IS 'Actividades físicas (JSON array)';
COMMENT ON COLUMN clinical_history.toxicomanias IS 'Toxicomanías (JSON array)';
COMMENT ON COLUMN clinical_history.gastrointestinal_disorders IS 'Trastornos gastrointestinales (JSON array)';
COMMENT ON COLUMN clinical_history.gyneco_obstetric_history IS 'Antecedentes gineco-obstétricos (JSON object)';
COMMENT ON COLUMN clinical_history.eating_habits IS 'Hábitos de alimentación (JSON object)';
COMMENT ON COLUMN clinical_history.food_frequency IS 'Frecuencia de consumo de alimentos (JSON object)';
COMMENT ON COLUMN clinical_history.food_recall_24h IS 'Recordatorio de 24 horas (JSON object)';
COMMENT ON COLUMN clinical_history.biochemical_indicators IS 'Indicadores bioquímicos (JSON array)';