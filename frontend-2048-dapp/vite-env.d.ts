/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_SEPOLIA_RPC_URL: string
  readonly VITE_BACKEND_API_URL: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_CHAIN_NAME: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    selectedAddress?: string
  }
}
