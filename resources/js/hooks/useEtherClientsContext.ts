import { EtherClientsContext } from "@/context/EtherClientsContext";
import { useContext } from "react";

export const useEtherClientsContext = () => {
  const context = useContext(EtherClientsContext)
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientProvider')
  }
  return context
}