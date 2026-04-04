// ESM wrapper for glkapi.js — evaluates the original CJS code in sloppy (non-strict) mode
// using the Function constructor, which does not inherit the module's strict mode.
// Returns a factory function so a fresh Glk instance is created each time.

import rawCode from './glkapi-raw.js?raw';

// Build a factory that creates a fresh Glk API each invocation
const createGlk = new Function(`${rawCode}\nreturn Glk;`);

export default createGlk;
