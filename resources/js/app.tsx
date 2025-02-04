import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { ServicesProvider } from './context/ServicesContext'
import { MetaMaskProvider } from '@metamask/sdk-react'
import { EtherClientsProvider } from './context/EtherClientsContext'
import { SnackbarProvider } from './hooks/useSnackbar'

createInertiaApp({
  resolve: name => {
    const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true })
    return pages[`./Pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <MetaMaskProvider debug={false} sdkOptions={{
        logging:{
            developerMode: false,
          },
        // communicationServerUrl: process.env.REACT_APP_COMM_SERVER_URL,
        checkInstallationImmediately: false,
        dappMetadata: {
          name: "Allowance Revocation App",
          // url: window.location.host,
        }
      }}>
          <EtherClientsProvider>
            <ServicesProvider>
              <SnackbarProvider>
                <App {...props} />
              </SnackbarProvider>
            </ServicesProvider>
          </EtherClientsProvider>
      </MetaMaskProvider>
    )
  },
})