import React from 'react'
import * as git from 'isomorphic-git'
import {v4 as uuidv4} from "uuid"
import FileListComponent from './FileListComponent'
import {readDirRec} from './Utils'
import BranchSelectorComponent from "./BranchSelectorComponent";
import CommitDialogComponent from "./CommitDialogComponent";

type GitOpts = {
    fs: git.PromiseFsClient,
    http: git.HttpClient,
    url: string,
    auth?: { username: string, password: string },
    corsProxy?: string
}

class GitFileListComponent extends React.Component<{
    gitOpts: GitOpts,
    onSelect: (file: string) => void,
    onError: (error: Error) => void
}, {
    loaded: boolean,
    branches: string[],
    files: string[],
    selectedBranch: string,
    selectedFile: string
}> {
    private dir: string

    constructor(props: any) {
        super(props)
        this.dir = ''
    }

    private cloneRepo() {
        const {gitOpts: {fs, http, url, corsProxy}} = this.props
        this.dir = '/' + uuidv4()
        git.clone({
            fs: fs,
            http: http,
            dir: this.dir,
            url: url,
            // @ts-ignore
            onAuth: url => gitOpts.auth,
            // @ts-ignore
            onAuthFailure: (url, auth) => {
                console.warn("git: failed to authenticate: " + url)
            },
            corsProxy: corsProxy,
            noCheckout: true,
            //singleBranch: true,
            //depth: 1,
            onProgress: e => {
                console.log(e)
            }
        }).then(() =>
            git.listBranches({
                fs,
                dir: this.dir,
                remote: 'origin'
            }).then(branches => {
                const filteredBranches = branches.filter(e => e !== 'HEAD')
                this.setState(state => ({...state, branches: filteredBranches}))
                console.log(filteredBranches)
                return filteredBranches
            })
        ).then((branches: string[]) =>
            this.checkout(branches[0])
        ).catch(error =>
            this.props.onError(error)
        )
    }

    private checkout(branch: string) {
        const {gitOpts: {fs}} = this.props
        git.checkout({
            fs,
            dir: this.dir,
            ref: branch,
            force: true
        }).then(() => {
            readDirRec(fs, this.dir).then(paths => {
                const files = paths
                    .filter(e => !e.endsWith('/'))
                    .sort((a, b) => a.localeCompare(b))

                this.setState(state => ({...state, files: files, error: undefined}))
            })
        }).then(() =>
            this.setState(state => ({...state, loaded: true}))
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
        const {files, branches, loaded} = this.state || {}
        const pathPrefix = this.dir.replace(/\/$/, '') + '/'
        return <div className="h-100 d-flex flex-column p-1 gap-1">
            <BranchSelectorComponent branches={branches || []} onSelect={branch => {
                this.setState(state => ({...state, selectedBranch: branch, loaded: false}))
                this.checkout(branch)
            }}/>
            {(files == null || branches == null || !loaded) ?
                <div className="d-flex justify-content-center pt-3">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div> :
                null}
            <div className="flex-fill d-flex flex-column">
                <FileListComponent files={files || []}
                                   render={e => e.substring(pathPrefix.length)}
                                   onSelect={file => {
                                       this.setState(state => ({...state, selectedFile: file}))
                                       onSelect(file)
                                   }}/>
            </div>
            <div>
                <CommitDialogComponent onCommit={message => console.log(message)}/>
            </div>
        </div>
    }
}

export default GitFileListComponent
export type {GitOpts}
