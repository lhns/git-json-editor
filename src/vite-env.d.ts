/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CORS_PROXY: string | undefined
    readonly VITE_CLIENT_IDS: string
    readonly VITE_REDIRECT_ORIGIN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
