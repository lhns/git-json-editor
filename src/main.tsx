import './style.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import {Buffer} from 'buffer'
import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
import MainComponent from "./MainComponent";
// @ts-ignore
globalThis.Buffer = Buffer

// @ts-ignore
const fs = new LightningFS('fs', {wipe: false})

const params = new URL(window.location.href).searchParams
const url: string | null = params.get('url')
const corsProxy: string | null = params.get('cors-proxy')

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
                    corsProxy: corsProxy || undefined
                }}
                client_id=""
                redirect_origin=""/>
    }</React.StrictMode>,
)
