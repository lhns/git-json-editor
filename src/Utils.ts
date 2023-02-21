import * as git from "isomorphic-git";

function dirPath(path: string): string {
    return path.replace(/\/?$/, '/')
}

function resolvePath(parent: string | null, child: string): string {
    return (parent != null ? dirPath(parent) : '') + child
}

function relativePath(path: string, parent: string | null): string {
    const prefix = (parent != null ? dirPath(parent) : '')
    if (path.startsWith(prefix)) {
        return path.substring(prefix.length)
    } else {
        return path
    }
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

function loadSchema(string: string, corsProxy?: string): Promise<{ schema: any, data?: any }> {
    const data = JSON.parse(string)
    const schemaUrl = data['$schema']
    if (schemaUrl == null) {
        return Promise.resolve({schema: {}, data})
    } else if (isMetaSchemaUrl(schemaUrl)) {
        return Promise.resolve({schema: data, data: undefined})
    } else {
        return fetch(withCorsProxy(schemaUrl, corsProxy))
            .then((response: Response) => response.json())
            .then((schema: any) => ({schema, data}))
    }
}

export {resolvePath, relativePath, readDirRec, withCorsProxy, isMetaSchemaUrl, loadSchema}
