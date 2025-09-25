// Helper function to safely parse JSON
export const parseJSONField = (jsonString, defaultValue = {}) => {
  if (!jsonString) return defaultValue
  try {
    return JSON.parse(jsonString)
  } catch {
    return defaultValue
  }
}