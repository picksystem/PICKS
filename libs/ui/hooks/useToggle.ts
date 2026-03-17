import { useState, useCallback } from 'react';

/**
 * Manages boolean state with toggle, setTrue, and setFalse helpers
 * More convenient than useState for boolean flags
 *
 * @example
 * const [isOpen, { toggle, setTrue: open, setFalse: close }] = useToggle(false);
 *
 * return (
 *   <>
 *     <Button onClick={open}>Open Modal</Button>
 *     <Modal isOpen={isOpen} onClose={close} />
 *     <Button onClick={toggle}>Toggle</Button>
 *   </>
 * );
 */
export function useToggle(
  initialValue: boolean = false,
): [boolean, { toggle: () => void; setTrue: () => void; setFalse: () => void }] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse }];
}
