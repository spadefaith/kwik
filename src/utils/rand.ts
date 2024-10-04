/**
 * Generates an initial unique identifier by creating a UUID, removing dashes,
 * and taking the first 5 characters of the resulting string.
 *
 * @remarks
 * This identifier is intended to be used as a short, unique string for various purposes
 * within the application. The use of `crypto.randomUUID()` ensures that the generated
 * ID is highly unlikely to collide with other IDs.
 *
 * @example
 * ```typescript
 * let initialId = crypto.randomUUID().replaceAll("-", "").substring(0, 5);
 * console.log(initialId); // Example output: 'a1b2c'
 * ```
 */
let initialId = null;
let idx = 0;

export const generateId = () => {
  if (!initialId) {
    if (typeof window == "undefined" || !window?.crypto?.randomUUID) {
      initialId = Math.random().toString(36).substring(2, 7);
    } else {
      initialId = window.crypto
        .randomUUID()
        .replaceAll("-", "")
        .substring(0, 5);
    }
  }
  return `x${initialId}${idx++}x`;
};
