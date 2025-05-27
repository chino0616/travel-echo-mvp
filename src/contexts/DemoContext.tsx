'use client';

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useCallback } from 'react';

interface DemoContextType {
  photos: string[];
  text: string;
  setPhotos: Dispatch<SetStateAction<string[]>>;
  setText: Dispatch<SetStateAction<string>>;
  clearAll: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  console.log('DemoProvider rendered');

  const [photos, setPhotosState] = useState<string[]>([]);
  const [text, setTextState] = useState('');

  const setPhotos = useCallback((update: SetStateAction<string[]>) => {
    console.log('setPhotos called with:', update);
    setPhotosState(prev => {
      const newPhotos = typeof update === 'function' ? update(prev) : update;
      console.log('Photos updated from:', prev, 'to:', newPhotos);
      return newPhotos;
    });
  }, []);

  const setText = useCallback((update: SetStateAction<string>) => {
    console.log('setText called with:', update);
    setTextState(prev => {
      const newText = typeof update === 'function' ? update(prev) : update;
      console.log('Text updated from:', prev, 'to:', newText);
      return newText;
    });
  }, []);

  const clearAll = useCallback(() => {
    console.log('clearAll called');
    setPhotos([]);
    setText('');
  }, [setPhotos, setText]);

  const value = {
    photos,
    text,
    setPhotos,
    setText,
    clearAll
  };

  console.log('DemoProvider value:', value);

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
} 