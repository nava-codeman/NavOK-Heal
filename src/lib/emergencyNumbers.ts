export const EMERGENCY_NUMBERS: Record<string, string> = {
  // Asia
  "IN": "112", // India (112 unified, 108 medical)
  "CN": "120", // China
  "JP": "119", // Japan
  "KR": "119", // South Korea
  "SG": "995", // Singapore
  "MY": "999", // Malaysia

  // North America
  "US": "911", // United States
  "CA": "911", // Canada
  "MX": "911", // Mexico

  // Europe (EU uses 112 universally)
  "GB": "999", // United Kingdom (112 also works)
  "FR": "15",  // France (15 SAMU, 112 general)
  "DE": "112", // Germany
  "IT": "112", // Italy
  "ES": "112", // Spain
  "RU": "103", // Russia (103 medical, 112 general)

  // Oceania
  "AU": "000", // Australia
  "NZ": "111", // New Zealand

  // South America
  "BR": "192", // Brazil (192 SAMU)
  "AR": "107", // Argentina

  // Africa
  "ZA": "10177", // South Africa (medical)
  "EG": "123", // Egypt
  "NG": "112", // Nigeria
};

/**
 * Returns the correct emergency number for a given country code (ISO 3166-1 alpha-2).
 * Defaults to "112" as it is the most widely adopted standard and works on most GSM phones globally.
 */
export function getEmergencyNumber(countryCode: string | null | undefined): string {
  if (!countryCode) return "112";
  return EMERGENCY_NUMBERS[countryCode.toUpperCase()] || "112";
}
