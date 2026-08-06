import { useEffect, useRef, useState } from 'react';

/**
 * Debounce a rapidly changing value — used by the search box so we issue one
 * request per pause in typing rather than one per keystroke.
 */
export const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

/**
 * Close a floating panel when the user clicks outside it or presses Escape.
 * Returns a ref to attach to the panel's outermost element.
 */
export const useClickOutside = (onClose, active = true) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return undefined;

    const handlePointer = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onClose();
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose, active]);

  return ref;
};

/**
 * Persist a small value (recent searches, view preference) in localStorage
 * without exploding in environments where storage is unavailable.
 */
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const save = (next) => {
    setValue(next);
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Private browsing / quota exceeded — the in-memory value still works
    }
  };

  return [value, save];
};

export default useDebounce;
