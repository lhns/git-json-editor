import React from 'react'
import * as git from 'isomorphic-git'
import {v4 as uuidv4} from "uuid"

type GitOpts = {
    fs: git.PromiseFsClient,
    http: git.HttpClient,
    url: string,
    auth?: { username: string, password: string },
    corsProxy?: string
}

class GitFileListComponent extends React.Component<{
    gitOpts: GitOpts,
    onSelect: (string: string) => void,
    onError: (error: Error) => void
}, { selected: string, files: string[] }> {
    private dir: string

    constructor(props: any) {
        super(props)
        this.dir = ''
    }

    private readDirRec(path: string, hidden: boolean = false): Promise<string[]> {
        const fs = this.props.gitOpts.fs.promises
        return fs.lstat(path).then((stat: { type: string }) => {
            if (stat.type === 'dir') {
                const dir = path.replace(/\/?$/, '/')
                return fs.readdir(path)
                    .then((files: string[]) => Promise.all(
                        files
                            .filter(fileName => hidden || !fileName.startsWith('.'))
                            .map(fileName => {
                                const filePath = dir + fileName
                                return this.readDirRec(filePath)
                            })
                    ))
                    .then((e: string[][]) => [dir].concat(e.flat()))
            } else {
                return [path]
            }
        })
    }

    private cloneRepo() {
        const {gitOpts} = this.props
        this.dir = '/' + uuidv4()
        git.clone({
            fs: gitOpts.fs,
            http: gitOpts.http,
            dir: this.dir,
            url: gitOpts.url,
            // @ts-ignore
            onAuth: url => gitOpts.auth,
            // @ts-ignore
            onAuthFailure: (url, auth) => {
                console.warn("git: failed to authenticate: " + url)
            },
            corsProxy: gitOpts.corsProxy,
            singleBranch: true,
            depth: 1,
            onProgress: e => {
                console.log(e)
            }
        }).then(() => {
            this.readDirRec(this.dir).then(paths => {
                const files = paths
                    .filter(e => !e.endsWith('/'))
                    .sort((a, b) => a.localeCompare(b))

                this.setState(state => ({...state, files: files, error: undefined}))
            })
        }).catch(error =>
            this.props.onError(error)
        )
    }

    componentDidMount() {
        this.cloneRepo()
    }

    componentDidUpdate(prevProps: any) {
        if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
            this.cloneRepo()
        }
    }

    componentWillUnmount() {
    }

    render() {
        const {gitOpts: {fs}, onSelect} = this.props
        const state = this.state
        if (state == null) {
            return <div className="d-flex justify-content-center pt-3">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        } else {
            const {files} = state
            const pathPrefix = this.dir.replace(/\/$/, '') + '/'
            return <table className="table table-sm table-hover">
                <tbody>
                {files.map(file => {
                    const selected = state.selected === file
                    return <tr key={file}>
                        <td className={(selected ? 'table-active' : '')}
                            onClick={() => {
                                this.setState(state => ({...state, selected: file}))
                                fs.promises.readFile(file, {encoding: 'utf8'})
                                    .then((string: string) => onSelect(string))
                            }}>{file.substring(pathPrefix.length)}</td>
                    </tr>
                })}
                </tbody>
            </table>
        }
    }
}

export default GitFileListComponent
export type {GitOpts}
