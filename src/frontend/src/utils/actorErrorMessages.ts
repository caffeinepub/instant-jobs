/**
 * Error normalization for actor method failures
 */

import { ActorMethodMissingError } from './actorGuards';

/**
 * Normalize actor errors into user-friendly messages
 */
export function normalizeActorError(error: unknown): string {
  // Handle our custom missing method error
  if (error instanceof ActorMethodMissingError) {
    return 'This feature is temporarily unavailable. Please try again later.';
  }

  // Handle generic errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check for common "method not found" patterns
    if (
      message.includes('is not a function') ||
      message.includes('method not found') ||
      message.includes('not available')
    ) {
      return 'This feature is temporarily unavailable. Please try again later.';
    }

    // Check for authorization/session errors
    if (
      message.includes('unauthorized') ||
      message.includes('permission') ||
      message.includes('authentication required')
    ) {
      return 'You do not have permission to perform this action. Please log in again.';
    }

    // Check for session/token errors
    if (
      message.includes('session') ||
      message.includes('token') ||
      message.includes('expired') ||
      message.includes('invalid')
    ) {
      return 'Your session has expired. Please log in again.';
    }

    // Check for signup/login specific errors
    if (message.includes('account with this email already exists')) {
      return 'An account with this email already exists. Please sign in instead.';
    }

    if (message.includes('no account found')) {
      return 'No account found. Please sign up first.';
    }

    if (message.includes('invalid email or password')) {
      return 'Invalid email or password. Please try again.';
    }

    // Check for credit/unlock errors
    if (message.includes('insufficient credits')) {
      return 'Insufficient credits to unlock this profile. Please contact admin.';
    }

    if (message.includes('already unlocked')) {
      return 'This profile has already been unlocked.';
    }

    // Check for backend trap errors
    if (message.includes('trap') || message.includes('failed:')) {
      // Extract the user-friendly part after "Failed:"
      const failedMatch = error.message.match(/Failed:\s*(.+)/i);
      if (failedMatch) {
        return failedMatch[1];
      }
    }

    // Check for network/connection errors
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout')
    ) {
      return 'Network error. Please check your connection and try again.';
    }

    // Check for Candid type mismatch
    if (message.includes('candid') || message.includes('type mismatch')) {
      console.error('Candid type mismatch:', error);
      return 'Data format error. Please contact support.';
    }

    // Return the original error message if it's user-friendly
    if (error.message && error.message.length < 100 && !message.includes('actor')) {
      return error.message;
    }
  }

  // Fallback for unknown errors
  console.error('Unhandled error:', error);
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Check if an error is a missing method error
 */
export function isMissingMethodError(error: unknown): boolean {
  if (error instanceof ActorMethodMissingError) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('is not a function') ||
      message.includes('method not found') ||
      message.includes('not available')
    );
  }

  return false;
}

/**
 * Check if an error is an authorization error
 */
export function isAuthorizationError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('unauthorized') ||
      message.includes('permission') ||
      message.includes('authentication required') ||
      message.includes('session') ||
      message.includes('token') ||
      message.includes('expired')
    );
  }
  return false;
}
