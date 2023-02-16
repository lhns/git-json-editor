import * as git from "isomorphic-git";

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

export {readDirRec, withCorsProxy, isMetaSchemaUrl}
