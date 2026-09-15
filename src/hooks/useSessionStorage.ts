import { useState, useEffect } from 'react';

export function useSessionStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const storedValue = sessionStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error('Error leyendo sessionStorage', error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
}