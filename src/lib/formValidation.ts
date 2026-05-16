export const countryCodes = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+971", label: "UAE (+971)" },
];

export const normalizeWebsiteUrl = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  return trimmedValue.startsWith("http://") || trimmedValue.startsWith("https://")
    ? trimmedValue
    : `https://${trimmedValue}`;
};

export const isValidWebsite = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return true;

  try {
    const url = new URL(normalizeWebsiteUrl(trimmedValue));
    return ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname.includes("."));
  } catch {
    return false;
  }
};

export const getPhoneValidationError = (countryCode: string, phoneNumber: string) => {
  const phoneDigits = phoneNumber.replace(/\D/g, "");

  if (!countryCode) {
    return "Please select a country code.";
  }

  if (!phoneDigits) {
    return "Phone number is required.";
  }

  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    return "Enter a valid phone number with 7 to 15 digits.";
  }

  return "";
};
