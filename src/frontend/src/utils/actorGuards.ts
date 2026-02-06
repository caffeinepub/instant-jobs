/**
 * Actor guard utilities to safely access backend methods
 */

export class ActorMethodMissingError extends Error {
  constructor(
    public methodName: string,
    public usedIn: string
  ) {
    super(`Backend method '${methodName}' is not available (called from: ${usedIn})`);
    this.name = 'ActorMethodMissingError';
  }
}

/**
 * Assert that a method exists on the actor
 */
export function assertActorMethod(
  actor: any,
  methodName: string,
  usedIn: string
): void {
  if (!actor) {
    throw new Error('Actor is not initialized');
  }

  if (typeof actor[methodName] !== 'function') {
    throw new ActorMethodMissingError(methodName, usedIn);
  }
}

/**
 * Safely call an actor method with guard check
 */
export async function guardedActorCall<T>(
  actor: any,
  methodName: string,
  usedIn: string,
  args: any[] = []
): Promise<T> {
  assertActorMethod(actor, methodName, usedIn);
  return actor[methodName](...args);
}
