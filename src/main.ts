import './style.css'
//import typescriptLogo from './typescript.svg'
//import { setupCounter } from './counter'
// @ts-ignore
import { JSONEditor } from '@json-editor/json-editor/dist/jsoneditor.js'

import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

import git from 'isomorphic-git'
import http from 'isomorphic-git/http/web'
import LightningFS from '@isomorphic-git/lightning-fs';

/*
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`
*/
const element = document.getElementById('app');

const fs = new LightningFS('fs', {wipe: true})

const dir = '/'
git.clone({
  fs,
  http,
  dir,
  url: 'https://github.com/json-editor/json-editor',
  corsProxy: 'https://cors.isomorphic-git.org',
  singleBranch: true,
  depth: 1,
  onProgress: e => {console.log(e)}
}).then(e => {
  console.log(e)
  console.log(fs)
  console.log(fs.promises.readdir(dir).then(console.log))
  fs.promises.readFile('/tests/fixtures/basic_person.json', {encoding: 'utf8'}).then(schemaString => {
    console.log(schemaString)
    
    const editor = new JSONEditor(element, {
      theme: 'bootstrap5',
      iconlib: 'openiconic',
      schema: JSON.parse(schemaString)
    });
  })
})



//setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
