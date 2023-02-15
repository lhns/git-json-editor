import React from 'react'
import * as git from 'isomorphic-git';

type GitOpts = {
    fs: git.PromiseFsClient,
    http: git.HttpClient,
    dir: string,
    url: string,
    auth?: { username: string, password: string },
    corsProxy?: string
}

class GitFileListComponent extends React.Component<{
    gitOpts: GitOpts,
    onSelect: (string: string) => void
}, { selected: string, files: string[] }> {
    private readDirRec(path: string, hidden: boolean = false): Promise<string[]> {
        const fs = this.props.gitOpts.fs.promises
        return fs.lstat(path).then((stat: { type: string }) => {
            if (stat.type === 'dir') {
                const dir = path.replace(/\/$/, '') + '/'
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

    componentDidMount() {
        const {gitOpts} = this.props
        git.clone({
            fs: gitOpts.fs,
            http: gitOpts.http,
            dir: gitOpts.dir,
            url: gitOpts.url,
            onAuth: url => gitOpts.auth,
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
            this.readDirRec(gitOpts.dir).then(paths => {
                const files = paths.filter(e => !e.endsWith('/'))
                this.setState({files: files})
            })
        })
    }

    componentDidUpdate(prevProps: any) {

    }

    componentWillUnmount() {

    }

    render() {
        const {gitOpts: {fs, dir}, onSelect} = this.props
        const state = this.state
        if (state === null) {
            return <div>Loading</div>
        } else {
            const {files} = state
            const pathPrefix = dir.replace(/\/$/, '') + '/'
            return <table className="table table-sm table-hover">
                <tbody>
                {files.map(file => {
                    const selected = state.selected === file
                    return <tr>
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

            /*<ul className="list-group">{files.map(file => {
                const selected = state.selected === file
                return <li className={'list-group-item' + (selected ? ' active' : '')}
                           aria-current={selected.toString()}
                           onClick={() => {
                               this.setState(state => ({...state, selected: file}))
                               fs.promises.readFile(file, {encoding: 'utf8'})
                                   .then((string: string) => onSelect(string))
                           }}>{file}</li>
            })}</ul>*/
        }
    }
}

export default GitFileListComponent
