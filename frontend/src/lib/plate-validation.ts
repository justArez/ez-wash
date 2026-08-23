/**
 * Vietnamese License Plate validation and normalization utilities.
 *
 * Vietnamese vehicle plate standard formats:
 * - 2-digit province code (11-99, excluding some numbers but usually \d{2})
 * - Series letter(s): 1 letter (A-Z) or 1 letter + 1 digit (e.g. 51F, 29A, 59A1, 29LD, 80NG, etc.)
 * - Serial number: 4 digits (old format, e.g. 1234) or 5 digits (new format, e.g. 123.45 or 12345)
 *
 * Examples accepted:
 * - Cars: "30A-123.45", "30A-12345", "51F 999.99", "29A-1234", "43A-88888"
 * - Motorcycles: "59-P1 123.45", "29-X1 9999", "60-B8 12345"
 * - Special/Commercial: "29LD-123.45", "80NG-123-45", "50MD-12345"
 */

// Regex covering all standard Vietnamese vehicle license plate formats (ignoring spaces, dashes, dots)
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
 * Formats a valid or partially formatted Vietnamese plate into standard display format (e.g. 30A-123.45 or 59P1-123.45).
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
