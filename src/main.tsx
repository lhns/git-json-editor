import './style.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import MainComponent from './MainComponent'

import {Buffer} from 'buffer'
import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';
// @ts-ignore
globalThis.Buffer = Buffer

// @ts-ignore
const fs = new LightningFS('fs', {wipe: false})

const params = new URL(window.location.href).searchParams
const url: string | null = params.get('url')
const corsProxy: string | null = params.get('cors-proxy')
const password: string | null = params.get('password')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>{
        url == null ?
            <div>
                No git url provided
            </div> :
            <MainComponent
                fs={fs}
                gitCloneOpts={{
                    http: http,
                    url: url,
                    auth: password != null ? {
                        username: 'token', //oauth2
                        password: password
                    } : undefined,
                    corsProxy: corsProxy || undefined
                }}/>
    }</React.StrictMode>,
)
