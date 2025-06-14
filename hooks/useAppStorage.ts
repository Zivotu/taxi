
import { useState, useEffect } from 'react';
import { DailyRecord } from '../types';

const STORAGE_KEY = 'taxiLogData';

export function useAppStorage<T,>(initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [storedValue]);

  return [storedValue, setStoredValue];
}
    