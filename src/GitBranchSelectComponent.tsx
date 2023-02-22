import React from 'react'
import * as git from 'isomorphic-git'
import {AuthCallback, GitProgressEvent} from 'isomorphic-git'
import {v4 as uuidv4} from "uuid"
import Select from "./html/Select"

type GitOpts = {
    http: git.HttpClient,
    url: string,
    corsProxy?: string,
    author?: { name: string, email: string },
    onAuth?: AuthCallback
}

class GitBranchSelectComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    initialBranch?: string,
    onSelect: (branch: string, repoDir: string) => void,
    onAuthFailure: (url: string) => void,
    onError: (error: Error) => void
}, {
    progress: GitProgressEvent,
    repoDir: string,
    branches: string[],
    selected: string
}> {
    private cloneRepo() {
        const {
            fs,
            gitOpts: {http, url, corsProxy, onAuth},
            initialBranch,
            onSelect,
            onAuthFailure,
            onError
        } = this.props

        const repoDir = '/' + uuidv4()
        this.setState(() => ({}))
        git.clone({
            fs,
            http,
            dir: repoDir,
            url,
            onAuth,
            onAuthFailure,
            corsProxy,
            noCheckout: true,
            //singleBranch: true,
            depth: 1,
            onProgress: progress => {
                this.setState(state => ({...state, progress: progress}))
            }
        }).then(() =>
            git.getRemoteInfo({
                http,
                url,
                onAuth,
                onAuthFailure,
                corsProxy
            })
        ).then(remoteInfo =>
            git.listBranches({
                fs,
                dir: repoDir,
                remote: 'origin'
            }).then(branches => {
                const filteredBranches = branches.filter(e => e !== 'HEAD')
                const mainBranch = remoteInfo.HEAD?.replace(/^refs\/heads\//, '')
                const selected = initialBranch != null && filteredBranches.includes(initialBranch) ?
                    initialBranch :
                    mainBranch != null && filteredBranches.includes(mainBranch) ?
                        mainBranch :
                        filteredBranches[0]
                this.setState(state => ({
                    ...state,
                    repoDir: repoDir,
                    branches: filteredBranches,
                    selected: selected
                }))
                onSelect(selected, repoDir)
            })
        ).catch(onError)
    }

    componentDidMount() {
        this.cloneRepo()
    }

    componentDidUpdate(prevProps: any) {
        const {fs, gitOpts} = this.props
        if (JSON.stringify([fs, gitOpts]) !== JSON.stringify([prevProps.fs, prevProps.gitOpts])) {
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
            label="Branch"
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
export type {GitOpts}
