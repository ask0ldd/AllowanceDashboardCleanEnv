import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

/* 
* Centralizes the core logic for snackbar functionality.
* Check DashboardLayout.tsx to know more about the component insertion
*/
interface SnackbarContextType {
  snackbarMessage: string | null
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string | null>>
  isVisible: boolean
  setIsVisible : (value: React.SetStateAction<boolean>) => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined)

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (snackbarMessage && snackbarMessage !== "") {
      setIsVisible(true)
      const timeoutId = setTimeout(() => {
        setIsVisible(false)
      }, 2500)
      return () => clearTimeout(timeoutId)
    }
  }, [snackbarMessage])

  const value = {
    snackbarMessage,
    setSnackbarMessage,
    isVisible,
    setIsVisible
  }

  return (
    <SnackbarContext.Provider value={value}>
      {children}
    </SnackbarContext.Provider>
  );
}

export default function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}
