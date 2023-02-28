import './style.scss'

import {Buffer} from 'buffer'
import React from 'react'
import ReactDOM from 'react-dom/client'
import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs'
import MainComponent from './MainComponent'
// @ts-ignore
import * as bootstrap from 'bootstrap'
// @ts-ignore
globalThis.Buffer = Buffer

// @ts-ignore
const fs = new LightningFS('fs', {wipe: false})

const params = new URL(window.location.href).searchParams
const url: string | null = params.get('url')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>{
        url == null ?
            <div>
                No git url provided
            </div> :
            <MainComponent
                fs={fs}
                gitOpts={{
                    http: http,
                    url: url,
                    corsProxy: import.meta.env.VITE_CORS_PROXY
                }}
                client_ids={JSON.parse(import.meta.env.VITE_CLIENT_IDS ?? '{}')}
                redirect_origin={import.meta.env.VITE_REDIRECT_ORIGIN}/>
    }</React.StrictMode>,
)
