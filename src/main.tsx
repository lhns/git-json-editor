import './style.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import MainComponent from './MainComponent'

import {Buffer} from 'buffer'
// @ts-ignore
globalThis.Buffer = Buffer

import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';

// @ts-ignore
const fs = new LightningFS('fs', {wipe: true})

const params = new URL(window.location.href).searchParams
const url: string | null = params.get('url')
const corsProxy: string | null = params.get('cors-proxy')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>{
        url == null ?
            <div>
                No git url provided
            </div> :
            <MainComponent gitOpts={{
                fs: fs,
                http: http,
                url: url,
                auth: {
                    username: 'oauth2',
                    password: 'glpat-rmv7bQDokFmR2i1YZaDd'
                },
                corsProxy: corsProxy ? corsProxy : undefined
            }}/>
    }</React.StrictMode>,
)
