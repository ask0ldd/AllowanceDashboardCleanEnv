import useModalManager from '@/hooks/useModalManager';
import React, { createContext, useContext } from 'react';

type ModalContextType = {
  modal: ReturnType<typeof useModalManager>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{children: React.ReactNode; modal: ReturnType<typeof useModalManager>}> = ({ children, modal }) => {
  return (
    <ModalContext.Provider value={{ modal }}>
      {children}
    </ModalContext.Provider>
  );
};