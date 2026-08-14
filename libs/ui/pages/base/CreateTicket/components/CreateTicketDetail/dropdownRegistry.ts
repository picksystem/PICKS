// ── Module-level dropdown coordination ─────────────────────────────────────────
// Tracks which SearchableField instance currently has its dropdown open.
// When a new field focuses, the previously-open one is told to close.
// No closure-stale issues because we always call the live setter.

type Closer = () => void;
let activeCloser: Closer | null = null;

export const activateDropdown = (closer: Closer): void => {
  if (activeCloser && activeCloser !== closer) {
    activeCloser();
  }
  activeCloser = closer;
};

export const deactivateDropdown = (closer: Closer): void => {
  if (activeCloser === closer) {
    activeCloser = null;
  }
};
