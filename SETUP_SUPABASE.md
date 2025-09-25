# Configuración de Supabase para DietLab

Este documento te guiará a través de la configuración de Supabase para que DietLab funcione correctamente.

## Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Haz clic en "New Project"
3. Elige tu organización
4. Asigna un nombre al proyecto: `dietlab`
5. Crea una contraseña segura para la base de datos
6. Selecciona una región cercana a tus usuarios
7. Haz clic en "Create new project"

### 2. Configurar Variables de Entorno

1. Ve a la sección "Settings" > "API" en tu proyecto de Supabase
2. Copia la `URL` y `anon/public key`
3. Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 3. Configurar la Base de Datos

1. Ve a la sección "SQL Editor" en tu proyecto de Supabase
2. Ejecuta el siguiente script SQL para crear las tablas necesarias:

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de pacientes
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  height DECIMAL(5,2), -- en cm
  weight DECIMAL(5,2), -- en kg
  goal TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  notes TEXT,
  avatar_url TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_patients_nutritionist ON patients(nutritionist_id);
CREATE INDEX idx_patients_status ON patients(status);

-- Habilitar Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para pacientes
CREATE POLICY "Users can view their own patients" ON patients
  FOR SELECT USING (auth.uid() = nutritionist_id);

CREATE POLICY "Users can insert their own patients" ON patients
  FOR INSERT WITH CHECK (auth.uid() = nutritionist_id);

CREATE POLICY "Users can update their own patients" ON patients
  FOR UPDATE USING (auth.uid() = nutritionist_id);

CREATE POLICY "Users can delete their own patients" ON patients
  FOR DELETE USING (auth.uid() = nutritionist_id);

-- Crear tabla de mediciones
CREATE TABLE IF NOT EXISTS measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  waist_circumference DECIMAL(5,2),
  hip_circumference DECIMAL(5,2),
  chest_circumference DECIMAL(5,2),
  arm_circumference DECIMAL(5,2),
  thigh_circumference DECIMAL(5,2),
  notes TEXT,
  measurement_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear índices para mediciones
CREATE INDEX idx_measurements_patient ON measurements(patient_id);
CREATE INDEX idx_measurements_date ON measurements(measurement_date);

-- Habilitar Row Level Security para mediciones
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para mediciones
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

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en la tabla patients
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Configurar Autenticación

1. Ve a "Authentication" > "Settings" en tu proyecto de Supabase
2. En "Site URL" asegúrate de que incluya:
   - Para desarrollo: `http://localhost:5173`
   - Para producción: `https://tu-usuario.github.io`

3. En "Redirect URLs" agrega:
   - Para desarrollo: `http://localhost:5173/dietlab/**`
   - Para producción: `https://tu-usuario.github.io/dietlab/**`

### 5. Configurar Email Templates (Opcional)

1. Ve a "Authentication" > "Email Templates"
2. Personaliza los templates de confirmación y recuperación de contraseña
3. Cambia el "From email" por tu dominio (opcional)

## Verificación

Para verificar que todo está configurado correctamente:

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:5173/dietlab/`
3. Regístrate como nuevo usuario
4. Deberías poder acceder al dashboard
5. Intenta crear un nuevo paciente
6. Verifica que aparezca en la lista

## Datos de Prueba (Opcional)

Si quieres datos de prueba, puedes ejecutar este script en el SQL Editor:

```sql
-- Insertar pacientes de prueba (ejecutar después de registrarte)
INSERT INTO patients (
  nutritionist_id,
  first_name,
  last_name,
  email,
  phone,
  date_of_birth,
  gender,
  height,
  weight,
  goal,
  status
) VALUES 
  (
    auth.uid(), -- Tu ID como nutricionista
    'María',
    'García',
    'maria@ejemplo.com',
    '+1234567890',
    '1990-05-15',
    'Femenino',
    165.0,
    70.0,
    'Perder peso y mejorar hábitos alimenticios',
    'active'
  ),
  (
    auth.uid(),
    'Carlos',
    'López',
    'carlos@ejemplo.com',
    '+1234567891',
    '1985-08-22',
    'Masculino',
    180.0,
    85.0,
    'Ganar masa muscular',
    'active'
  );
```

## Solución de Problemas

### Error: "Invalid API key"
- Verifica que hayas copiado correctamente las variables de entorno
- Asegúrate de que el archivo `.env` esté en la raíz del proyecto
- Reinicia el servidor de desarrollo después de agregar las variables

### Error: "Row Level Security"
- Verifica que hayas ejecutado todas las políticas de seguridad
- Asegúrate de estar autenticado antes de realizar operaciones

### Error: "Permission denied"
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de que el usuario autenticado sea el propietario de los datos

## Notas Importantes

- **Nunca** subas el archivo `.env` a GitHub
- Las variables de entorno deben empezar con `VITE_` para ser accesibles en el frontend
- Row Level Security está habilitado para proteger los datos de cada nutricionista
- Cada nutricionista solo puede ver y modificar sus propios pacientes