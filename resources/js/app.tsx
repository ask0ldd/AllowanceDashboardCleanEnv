import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { ServicesProvider } from './context/ServicesContext'
import { MetaMaskProvider } from '@metamask/sdk-react'

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
          checkInstallationImmediately: false, // This will automatically connect to MetaMask on page load
          dappMetadata: {
            name: "Demo React App",
            url: window.location.host,
          }
      }}>
        <ServicesProvider>
          <App {...props} />
        </ServicesProvider>
      </MetaMaskProvider>
    )
  },
})