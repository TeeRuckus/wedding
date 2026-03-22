/**
 * Sanitises a guest name for database lookup.
 * Trims whitespace, collapses multiple spaces, and converts to title case.
 *
 * @param {string} name - Raw name input from the user
 * @returns {string} Cleaned name ready for comparison
 */
export function sanitiseName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Normalises a name to lowercase with no extra whitespace,
 * for case-insensitive database comparisons.
 *
 * @param {string} name
 * @returns {string}
 */
export function normaliseForLookup(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Validates that a name is non-empty and contains only letters,
 * hyphens, apostrophes, and spaces.
 *
 * @param {string} name
 * @returns {{ valid: boolean, message: string }}
 */
export function validateName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Please enter a name.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters.' };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return { valid: false, message: 'Name can only contain letters, hyphens, and apostrophes.' };
  }
  return { valid: true, message: '' };
}
