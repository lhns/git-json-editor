import React from 'react'
import * as git from 'isomorphic-git'
import {GitProgressEvent} from 'isomorphic-git'
import {v4 as uuidv4} from "uuid"
import Select from "./Select";

type GitCloneOpts = {
    http: git.HttpClient,
    url: string,
    auth?: { username: string, password: string },
    corsProxy?: string
}

class GitBranchSelectComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitCloneOpts: GitCloneOpts,
    onSelect: (branch: string, repoDir: string) => void,
    onError: (error: Error) => void
}, {
    progress: GitProgressEvent,
    repoDir: string,
    branches: string[],
    selected: string
}> {
    private cloneRepo() {
        const {fs, gitCloneOpts: {http, url, auth, corsProxy}, onSelect, onError} = this.props
        const repoDir = '/' + uuidv4()
        this.setState(() => ({}))
        git.clone({
            fs,
            http,
            dir: repoDir,
            url,
            onAuth: () => auth,
            onAuthFailure: (url) => {
                console.warn("git: failed to authenticate: " + url)
            },
            corsProxy,
            noCheckout: true,
            //singleBranch: true,
            //depth: 1,
            onProgress: progress => this.setState(state => ({...state, progress: progress}))
        })
            .then(() =>
                git.listBranches({
                    fs,
                    dir: repoDir,
                    remote: 'origin'
                })
            )
            .then(branches => {
                const filteredBranches = branches.filter(e => e !== 'HEAD')
                const initialBranch = filteredBranches[0]
                this.setState(state => ({
                    ...state,
                    repoDir: repoDir,
                    branches: filteredBranches,
                    selected: initialBranch
                }))
                onSelect(initialBranch, repoDir)
            })
            .catch(onError)
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
        const {onSelect} = this.props
        const {progress, repoDir, branches, selected} = this.state || {}
        const loading = progress ? progress.phase + '...' : 'Loading...'

        return <Select
            items={branches || [loading]}
            disabled={branches == null}
            selected={selected}
            onSelect={branch => {
                this.setState(state => ({...state, selected: branch}))
                onSelect(branch, repoDir)
            }}/>
    }
}

export default GitBranchSelectComponent
export type {GitCloneOpts}
