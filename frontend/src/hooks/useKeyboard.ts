import { useEffect } from 'react';

export const useKeyboard = (actions: Record<string, (e: KeyboardEvent) => void>, deps = []) => {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.code in actions) {
        actions[event.code](event);
      }
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
    };
  }, deps);
};
