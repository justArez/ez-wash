/**
 * Vietnamese License Plate validation and normalization utilities.
 *
 * Vietnamese vehicle plate standard formats:
 * - 2-digit province code (11-99)
 * - Series letter(s): 1 letter (A-Z), 1 letter + 1 digit (e.g. 59P1), or 2 letters (e.g. 29LD, 80NG)
 * - Serial number: 4 digits or 5 digits
 */

const VN_PLATE_CLEAN_REGEX = /^([1-9]\d)([A-Z]|[A-Z]\d|[A-Z]{2})(\d{4}|\d{5})$/;

/**
 * Normalizes a license plate string by trimming, capitalizing, and removing extraneous dashes/dots/spaces.
 */
export function cleanPlateString(plate: string): string {
  return plate
    .trim()
    .toUpperCase()
    .replace(/[\s.\-_/]+/g, "");
}

/**
 * Validates whether a given string is a valid Vietnamese license plate.
 */
export function isValidVietnamesePlate(plate?: string | null): boolean {
  if (!plate) return false;
  const clean = cleanPlateString(plate);
  return VN_PLATE_CLEAN_REGEX.test(clean);
}

/**
 * Formats a valid Vietnamese plate into standard display format (e.g. 30A-123.45 or 59P1-123.45).
 */
export function formatVietnamesePlate(plate: string): string {
  const clean = cleanPlateString(plate);
  const match = clean.match(VN_PLATE_CLEAN_REGEX);
  if (!match) {
    return plate.trim().toUpperCase();
  }

  const [, province, series, num] = match;
  if (num.length === 5) {
    return `${province}${series}-${num.slice(0, 3)}.${num.slice(3)}`;
  }
  return `${province}${series}-${num}`;
}
