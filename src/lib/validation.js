/**
 * Sanitises a guest name for database lookup.
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
 * Normalises a name to lowercase for case-insensitive comparison.
 */
export function normaliseForLookup(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Validates a name field.
 */
export function validateName(name) {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Please enter a name.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters.' };
  }
  if (!/^[a-zA-Z\s'\-]+$/.test(trimmed)) {
    return { valid: false, message: 'Name can only contain letters, hyphens, and apostrophes.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validates a time string.
 * Accepts 24-hour ("14:30") or 12-hour ("2:30 PM") format.
 */
export function validateTime(time) {
  const trimmed = (time || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Please enter a time.' };
  }

  // 24-hour: 0:00 to 23:59
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const h = parseInt(match24[1], 10);
    const m = parseInt(match24[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return { valid: true, message: '' };
    }
    return { valid: false, message: 'Invalid time. Use HH:MM (e.g. 14:30).' };
  }

  // 12-hour: "2:30 PM"
  const match12 = trimmed.toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    const h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
      return { valid: true, message: '' };
    }
    return { valid: false, message: 'Invalid time. Use H:MM AM/PM (e.g. 2:30 PM).' };
  }

  return { valid: false, message: 'Use HH:MM (e.g. 14:30) or H:MM AM/PM (e.g. 2:30 PM).' };
}

/**
 * Validates an optional time string (empty is OK).
 */
export function validateTimeOptional(time) {
  const trimmed = (time || '').trim();
  if (!trimmed) return { valid: true, message: '' };
  return validateTime(trimmed);
}

/**
 * Validates a table number (1–14 for this venue).
 */
export function validateTableNumber(value) {
  const trimmed = (value || '').toString().trim();
  if (!trimmed) {
    return { valid: false, message: 'Table number is required.' };
  }
  const num = parseInt(trimmed, 10);
  if (isNaN(num) || num < 1 || num > 14) {
    return { valid: false, message: 'Table number must be between 1 and 14.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validates a seat number (1–12 to cover bridal table).
 */
export function validateSeatNumber(value) {
  const trimmed = (value || '').toString().trim();
  if (!trimmed) {
    return { valid: false, message: 'Seat number is required.' };
  }
  const num = parseInt(trimmed, 10);
  if (isNaN(num) || num < 1 || num > 12) {
    return { valid: false, message: 'Seat number must be between 1 and 12.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validates an email address.
 */
export function validateEmail(email) {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Please enter an email.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validates a password.
 */
export function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Please enter a password.' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validates a required text field.
 */
export function validateRequired(value, fieldName = 'This field') {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true, message: '' };
}
