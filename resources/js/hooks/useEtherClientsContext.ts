import { EtherClientsContext } from "@/context/EtherClientsContext";
import { useContext } from "react";

/* 
* Gives access to a context where the public and the wallet clients are stored
*/
export const useEtherClientsContext = () => {
  const context = useContext(EtherClientsContext)
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientProvider')
  }
  return context
}