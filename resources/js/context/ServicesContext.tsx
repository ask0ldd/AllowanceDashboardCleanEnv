import ERC20TokenService from "@/services/ERC20TokenService"
import LocalStorageService from "@/services/LocalStorageService"
import MetaMaskService from "@/services/MetaMaskService"
import { createContext, ReactNode } from "react"

/*
* Contains all the instanciated services used through the app
* Insertion : app.tsx
*/
export interface ServicesContextType {
    metamaskService: MetaMaskService
    erc20TokenService: ERC20TokenService
    localStorageService : LocalStorageService
}

const defaultContextValue: ServicesContextType = {
    metamaskService: new MetaMaskService(),
    erc20TokenService: new ERC20TokenService(),
    localStorageService: new LocalStorageService(),
}

export const ServicesContext = createContext<ServicesContextType>(defaultContextValue)

interface ServicesProviderProps {
    children: ReactNode
    customServices?: Partial<ServicesContextType>
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