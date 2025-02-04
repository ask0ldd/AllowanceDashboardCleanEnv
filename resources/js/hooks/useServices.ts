import { useContext } from "react";
import { ServicesContext } from "../context/ServicesContext";

// export const useServices = () => useContext(ServicesContext)

export function useServices() {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider')
  }
  return context
}