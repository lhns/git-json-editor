import * as git from "isomorphic-git"
import {resolve} from "@isomorphic-git/lightning-fs/src/path";

function relativePath(path: string, parent: string | null): string {
    const prefix = (parent != null ? parent.replace(/\/?$/, '/') : '')
    if (path.startsWith(prefix)) {
        return path.substring(prefix.length)
    } else {
        return path
    }
}

function isUrl(url: string): boolean {
    return /[^:\/]+:\/\//.test(url)
}

function readDirRec(fs: git.PromiseFsClient, path: string, hidden: boolean = false): Promise<string[]> {
    return fs.promises.lstat(path).then((stat: { type: string }) => {
        if (stat.type === 'dir') {
            const dir = path.replace(/\/?$/, '/')
            return fs.promises.readdir(path)
                .then((files: string[]) => Promise.all(
                    files
                        .filter(fileName => hidden || !fileName.startsWith('.'))
                        .map(fileName => {
                            const filePath = dir + fileName
                            return readDirRec(fs, filePath, hidden)
                        })
                ))
                .then((e: string[][]) => [dir].concat(e.flat()))
        } else {
            return [path]
        }
    })
}

function withCorsProxy(url: string, corsProxy?: string): string {
    return corsProxy ? corsProxy.replace(/\/?$/, '/') +
        url.replace(/^https?:\/\//, '') : url
}

function isMetaSchemaUrl(schemaUrl: string): boolean {
    return /^https?:\/\/json-schema.org\/.*\/schema#?$/.test(schemaUrl)
}

function loadSchema(string: string, fs: git.PromiseFsClient, dir: string, corsProxy?: string): Promise<{ schema: any, data?: any }> {
    const data = JSON.parse(string)
    const schemaUrl = data['$schema']
    if (schemaUrl == null) {
        return Promise.resolve({schema: {}, data})
    } else if (isMetaSchemaUrl(schemaUrl)) {
        return Promise.resolve({schema: data, data: undefined})
    } else if (isUrl(schemaUrl)) {
        return fetch(withCorsProxy(schemaUrl, corsProxy))
            .then((response: Response) => response.json())
            .then((schema: any) => ({schema, data}))
    } else {
        return fs.promises.readFile(
            resolve(dir, schemaUrl),
            {encoding: 'utf8'}
        ).then((string: string) => ({schema: JSON.parse(string), data}))
    }
}

export {relativePath, readDirRec, withCorsProxy, isMetaSchemaUrl, loadSchema}
