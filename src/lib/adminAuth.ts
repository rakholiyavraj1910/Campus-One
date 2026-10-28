/**
 * CampusOne Dedicated Administrator Authentication Helper
 * Government Polytechnic Ahmedabad
 * 
 * Provides secure, deterministic username normalization, validation, and canonical
 * email resolution for institutional administrator authentication without exposing
 * credentials in client-side code.
 */

export const DEFAULT_ADMIN_USERNAME = 'vibhusuvaliyacampusone';
export const DEFAULT_ADMIN_EMAIL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAIL)
    ? String(import.meta.env.VITE_ADMIN_EMAIL).trim().toLowerCase()
    : 'vibhusuvaliya@gmail.com';

/**
 * Normalizes an administrative username or email address into a canonical
 * email for Supabase GoTrue authentication.
 * 
 * Guarantees a single, deterministic institutional email resolution:
 * - The dedicated admin username ("vibhusuvaliyacampusone") deterministically maps
 *   exclusively to the verified administrator email (e.g. "vibhusuvaliya@gmail.com").
 * - Fully qualified email addresses are normalized and preserved.
 * - Arbitrary usernames without '@' are NOT synthesized into fake emails, preventing
 *   silent generation of multiple identities.
 */
export function resolveAdminCandidateEmails(identifier: string): string[] {
  const trimmed = (identifier || '').trim().toLowerCase();
  if (!trimmed) return [];

  // Deterministically map dedicated admin username strictly to canonical email
  if (trimmed === DEFAULT_ADMIN_USERNAME.toLowerCase()) {
    return [DEFAULT_ADMIN_EMAIL];
  }

  // If already a qualified email address with valid email format
  if (trimmed.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return [trimmed];
  }

  // Reject arbitrary non-matching usernames to avoid silent generation of unauthorized identities
  return [];
}

/**
 * Validates admin sign-in inputs before submission.
 */
export function validateAdminInput(identifier: string, password: string): { valid: boolean; error?: string } {
  const trimmedId = (identifier || '').trim();
  const hasIdentifier = Boolean(trimmedId);
  const hasPassword = Boolean(password && password.length > 0);

  if (!hasIdentifier && !hasPassword) {
    return {
      valid: false,
      error: 'Please enter your administrator username and password.'
    };
  }

  if (!hasIdentifier) {
    return {
      valid: false,
      error: 'Please enter your administrator username or email.'
    };
  }

  if (!hasPassword) {
    return {
      valid: false,
      error: 'Please enter your administrator password.'
    };
  }

  const normalized = trimmedId.toLowerCase();
  const isDedicatedAdmin = normalized === DEFAULT_ADMIN_USERNAME.toLowerCase();
  const isValidEmail = normalized.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);

  if (!isDedicatedAdmin && !isValidEmail) {
    return {
      valid: false,
      error: 'Unrecognized administrator username. Please enter the configured username ("vibhusuvaliyacampusone") or your registered institutional administrator email.'
    };
  }

  return { valid: true };
}
