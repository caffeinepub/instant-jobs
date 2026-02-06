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

    // Check for authorization errors
    if (message.includes('unauthorized') || message.includes('permission')) {
      return 'You do not have permission to perform this action.';
    }

    // Check for network/connection errors
    if (
      message.includes('network') ||
      message.includes('connection') ||
      message.includes('timeout')
    ) {
      return 'Network error. Please check your connection and try again.';
    }

    // Return the original error message if it's user-friendly
    if (error.message && error.message.length < 100) {
      return error.message;
    }
  }

  // Fallback for unknown errors
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
