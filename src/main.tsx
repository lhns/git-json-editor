import './style.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import MainComponent from './MainComponent'

// @ts-ignore
import {JSONEditor} from '@json-editor/json-editor/dist/jsoneditor.js'

import {Buffer} from 'buffer'
// @ts-ignore
globalThis.Buffer = Buffer

import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';

const element = document.getElementById('root');

const fs = new LightningFS('fs', {wipe: true})
const dir = '/test'
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <MainComponent gitOpts={{
            fs: fs,
            http: http,
            dir: dir,
            url: '',
            auth: {
                username: 'oauth2',
                password: ''
            },
            corsProxy: ''
        }}/>
    </React.StrictMode>,
)

/*git.clone({
    fs,
    http,
    dir,
    //url: 'https://gitlab.zpc.bms.ads/zpc/json-container-schema',
    url: 'https://gitlab.zpc.bms.ads/zpc/aufjson.git',
    onAuth: url => {
        console.log("AUTH")
        return {
            username: 'oauth2',
            password: 'glpat-rmv7bQDokFmR2i1YZaDd'
        }
    },
    onAuthFailure: (url, auth) => {
        console.log("failure")
    },
    corsProxy: 'http://10.55.60.97:8079',
    singleBranch: true,
    depth: 1,
    onProgress: e => {
        console.log(e)
    }
}).then(e => {
    console.log(e)
    console.log(fs)
    console.log(fs.promises.readdir(dir).then(console.log))
    fs.promises.readFile('/container_schema.json' '/core/src/main/resources/auftragssatz.schema.json', {encoding: 'utf8'})
        .then(schemaString => {
            if (typeof schemaString === 'string') {
                console.log(schemaString)
                JSON.parse(schemaString)

                const editor = new JSONEditor(element, {
                    theme: 'bootstrap5',
                    iconlib: 'openiconic',
                    schema: JSON.parse(schemaString)
                });
            }
        })
})*/
