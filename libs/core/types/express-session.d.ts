import 'express-session';

/**
 * Declare the properties we store on the server-side session so they type-check
 * in every compilation that includes the backend code. `req.session` is typed
 * as `Session & Partial<SessionData>`, so adding to SessionData augments every
 * request's session object.
 *
 * This lives in libs/core (not gateways/) because libs/core is built as its
 * own project (libs/tsconfig.lib.json) where the backend request code that
 * reads/writes `req.session.userId` already lives (auth middleware, session
 * service). Keeping the augmentation with that code guarantees any build of
 * the lib picks it up.
 */
declare module 'express-session' {
  interface SessionData {
    /** The signed-in user's id. Set on sign-in; the session is re-validated
     * (against the DB) on every protected request so it stays revocable. */
    userId?: number;
  }
}
