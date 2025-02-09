import { useContext } from "react";
import { ServicesContext } from "../context/ServicesContext";

/* 
* Gives access to a context where all services used through the app are instanciated
*/
export function useServices() {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider')
  }
  return context
}