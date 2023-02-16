import React from 'react'
import * as git from 'isomorphic-git'
import InputDialog from "./InputDialog";
import {GitCloneOpts} from "./GitBranchSelectComponent";

class GitCommitDialog extends React.Component<{
    fs: git.PromiseFsClient,
    gitCloneOpts: GitCloneOpts,
    repoDir: string,
    branch: string,
    changes: [string, boolean][],
    onCommit: (message: string) => void,
    onError: (error: Error) => void
}, {
    disabled: boolean
}> {
    render() {
        const {fs, gitCloneOpts: {http, auth}, repoDir, branch, changes, onCommit, onError} = this.props
        const {disabled} = this.state || {}
        return <InputDialog
            action={`Commit (${changes.length})`}
            placeholder="Commit Message"
            disabled={disabled || changes.length == 0}
            onConfirm={message => {
                this.setState(state => ({...state, disabled: true}))
                Promise.all(
                    changes.map(([filepath, status]) =>
                        status ?
                            git.add({fs, dir: repoDir, filepath}) :
                            git.remove({fs, dir: repoDir, filepath})
                    )
                ).then(() =>
                    git.commit({
                        fs,
                        dir: repoDir,
                        author: {
                            name: 'Test',
                            email: 'test@example.com',
                        },
                        message: message
                    })
                ).then(() =>
                    git.push({
                        fs,
                        http,
                        dir: repoDir,
                        remote: 'origin',
                        ref: branch,
                        onAuth: () => auth,
                        onAuthFailure: (url) => {
                            console.warn("git: failed to authenticate: " + url)
                        },
                    })
                ).then(() => {
                    onCommit(message)
                    this.setState(state => ({...state, disabled: false}))
                }).catch(onError)
            }}/>
    }
}

export default GitCommitDialog
