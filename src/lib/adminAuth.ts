/**
 * CampusOne Dedicated Administrator Authentication Helper
 * Government Polytechnic Ahmedabad
 * 
 * Provides secure username normalization, validation, and candidate
 * email resolution for the dedicated admin login flow without exposing
 * credentials in client-side code.
 */

export const DEFAULT_ADMIN_USERNAME = 'vibhusuvaliyacampusone';
export const DEFAULT_ADMIN_EMAIL = 'vibhusuvaliyacampusone@gpahmedabad.ac.in';
export const FALLBACK_ADMIN_EMAIL = 'vibhusuvaliyacampusone@campusone.edu';

/**
 * Normalizes an administrative username or email address into candidate
 * emails for Supabase GoTrue authentication.
 * 
 * Accepts the dedicated admin username ("vibhusuvaliyacampusone") exactly
 * as specified without forcing the user to type an institutional domain.
 */
export function resolveAdminCandidateEmails(identifier: string): string[] {
  const trimmed = identifier.trim().toLowerCase();
  if (!trimmed) return [];

  // If already a fully qualified email address
  if (trimmed.includes('@')) {
    return [trimmed];
  }

  // If matches dedicated admin username
  if (trimmed === DEFAULT_ADMIN_USERNAME.toLowerCase()) {
    return [DEFAULT_ADMIN_EMAIL, FALLBACK_ADMIN_EMAIL];
  }

  // Institutional domain fallback for standard administrator usernames
  return [
    `${trimmed}@gpahmedabad.ac.in`,
    `${trimmed}@campusone.edu`
  ];
}

/**
 * Validates admin sign-in inputs before submission.
 */
export function validateAdminInput(identifier: string, password: string): { valid: boolean; error?: string } {
  const hasIdentifier = Boolean(identifier && identifier.trim());
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
      error: 'Please enter your master administrator password.'
    };
  }

  return { valid: true };
}
