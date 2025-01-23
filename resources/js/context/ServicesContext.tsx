import ERC20TokenService from "@/services/ERC20TokenService"
import MetaMaskService from "@/services/MetaMaskService"
import { createContext, ReactNode } from "react"

export interface ServicesContextType {
    metamaskService: MetaMaskService
    erc20TokenService: ERC20TokenService
}

const defaultContextValue: ServicesContextType = {
    metamaskService: new MetaMaskService(),
    erc20TokenService: new ERC20TokenService(),
}

export const ServicesContext = createContext<ServicesContextType>(defaultContextValue)

interface ServicesProviderProps {
    children: ReactNode;
    customServices?: Partial<ServicesContextType>;
  }
  
export function ServicesProvider({ children, customServices }: ServicesProviderProps) {
    const contextValue: ServicesContextType = {
      ...defaultContextValue,
      ...customServices,
    }
  
    return (
        <ServicesContext.Provider value={contextValue}>
            {children}
        </ServicesContext.Provider>
    )
}

// wrapping happens into app.tsx