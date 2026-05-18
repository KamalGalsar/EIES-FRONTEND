/**
 * Privacy utilities for PII masking and aliasing.
 */

/**
 * Masks an email address by obfuscating the local part.
 * Example: "john.doe@example.com" -> "j***e@example.com"
 */
export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return "—";
  if (!email.includes("@")) return email;
  
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `*@${domain}`;
  
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

/**
 * Masks a name by keeping only the first and last letters or showing an alias.
 * Example: "John Doe" -> "J***e"
 */
export const maskName = (name: string | null | undefined): string => {
  if (!name) return "—";
  if (name.length <= 2) return "***";
  
  return `${name[0]}***${name[name.length - 1]}`;
};

/**
 * Determines if a string is a UPN/Email or a regular Name and masks accordingly.
 */
export const maskPII = (value: string | null | undefined): string => {
  if (!value) return "—";
  if (value.includes("@")) return maskEmail(value);
  return maskName(value);
};

/**
 * Checks if privacy mode is enabled (defaults to true).
 */
export const isPrivacyModeEnabled = (): boolean => {
  const stored = localStorage.getItem("privacyMode");
  return stored === null ? true : stored === "true";
};

/**
 * Toggles privacy mode and persists it.
 */
export const togglePrivacyMode = (enabled: boolean): void => {
  localStorage.setItem("privacyMode", String(enabled));
};
