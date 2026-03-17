import { useCallback, useMemo, useState } from 'react';

/**
 * Hook for array manipulation with memoized operations
 * Provides common array operations with TypeScript support
 *
 * @example
 * const {
 *   items,
 *   filter,
 *   map,
 *   find,
 *   reduce,
 *   push,
 *   remove,
 *   clear
 * } = useArray<Product>(initialProducts);
 */
export function useArray<T>(initialValue: T[] = []) {
  const [items, setItems] = useState<T[]>(initialValue);

  /**
   * Filter array items
   */
  const filter = useCallback(
    (predicate: (item: T, index: number, array: T[]) => boolean) => {
      return items.filter(predicate);
    },
    [items],
  );

  /**
   * Map array items
   */
  const map = useCallback(
    <U>(callback: (item: T, index: number, array: T[]) => U): U[] => {
      return items.map(callback);
    },
    [items],
  );

  /**
   * Find single item
   */
  const find = useCallback(
    (predicate: (item: T, index: number, array: T[]) => boolean): T | undefined => {
      return items.find(predicate);
    },
    [items],
  );

  /**
   * Find index of item
   */
  const findIndex = useCallback(
    (predicate: (item: T, index: number, array: T[]) => boolean): number => {
      return items.findIndex(predicate);
    },
    [items],
  );

  /**
   * Reduce array to single value
   */
  const reduce = useCallback(
    <U>(
      callback: (accumulator: U, current: T, index: number, array: T[]) => U,
      initialValue: U,
    ): U => {
      return items.reduce(callback, initialValue);
    },
    [items],
  );

  /**
   * Execute callback for each item
   */
  const forEach = useCallback(
    (callback: (item: T, index: number, array: T[]) => void): void => {
      items.forEach(callback);
    },
    [items],
  );

  /**
   * Check if some items match predicate
   */
  const some = useCallback(
    (predicate: (item: T, index: number, array: T[]) => boolean): boolean => {
      return items.some(predicate);
    },
    [items],
  );

  /**
   * Check if all items match predicate
   */
  const every = useCallback(
    (predicate: (item: T, index: number, array: T[]) => boolean): boolean => {
      return items.every(predicate);
    },
    [items],
  );

  /**
   * Add item(s) to end of array
   */
  const push = useCallback((...newItems: T[]) => {
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  /**
   * Add item(s) to beginning of array
   */
  const unshift = useCallback((...newItems: T[]) => {
    setItems((prev) => [...newItems, ...prev]);
  }, []);

  /**
   * Remove item at index
   */
  const removeAt = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Remove items matching predicate
   */
  const remove = useCallback((predicate: (item: T) => boolean) => {
    setItems((prev) => prev.filter((item) => !predicate(item)));
  }, []);

  /**
   * Update item at index
   */
  const updateAt = useCallback((index: number, newItem: T) => {
    setItems((prev) => prev.map((item, i) => (i === index ? newItem : item)));
  }, []);

  /**
   * Update items matching predicate
   */
  const update = useCallback((predicate: (item: T) => boolean, newItem: T | ((item: T) => T)) => {
    setItems((prev) =>
      prev.map((item) => {
        if (predicate(item)) {
          return typeof newItem === 'function' ? (newItem as (item: T) => T)(item) : newItem;
        }
        return item;
      }),
    );
  }, []);

  /**
   * Clear all items
   */
  const clear = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Reset to initial value
   */
  const reset = useCallback(() => {
    setItems(initialValue);
  }, [initialValue]);

  /**
   * Set entire array
   */
  const set = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  /**
   * Sort array
   */
  const sort = useCallback((compareFn?: (a: T, b: T) => number) => {
    setItems((prev) => [...prev].sort(compareFn));
  }, []);

  /**
   * Reverse array
   */
  const reverse = useCallback(() => {
    setItems((prev) => [...prev].reverse());
  }, []);

  // Memoized computed values
  const length = useMemo(() => items.length, [items]);
  const isEmpty = useMemo(() => items.length === 0, [items]);
  const first = useMemo(() => items[0], [items]);
  const last = useMemo(() => items[items.length - 1], [items]);

  return {
    items,
    filter,
    map,
    find,
    findIndex,
    reduce,
    forEach,
    some,
    every,
    push,
    unshift,
    removeAt,
    remove,
    updateAt,
    update,
    clear,
    reset,
    set,
    sort,
    reverse,
    length,
    isEmpty,
    first,
    last,
  };
}
