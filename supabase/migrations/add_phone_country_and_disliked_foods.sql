-- Add phone country code and disliked foods fields to patients table

-- Add phone_country_code column
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(5) DEFAULT '+502';

-- Add disliked_foods column
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS disliked_foods TEXT;

-- Update existing records to have default phone country code if they have a phone number
UPDATE patients 
SET phone_country_code = '+502' 
WHERE phone IS NOT NULL AND phone != '' AND phone_country_code IS NULL;