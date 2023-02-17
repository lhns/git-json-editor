import React from 'react'
import * as git from 'isomorphic-git'
import SubmitTextDialog from "./html/SubmitTextDialog";
import {GitOpts} from "./GitBranchSelectComponent";

class GitCommitDialog extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    repoDir: string,
    branch: string,
    changes: [string, boolean][],
    onCommit: (message: string) => void,
    onAuthFailure: (url: string) => void,
    onError: (error: Error) => void
}, {
    disabled: boolean
}> {
    render() {
        const {
            fs,
            gitOpts: {http, author, onAuth},
            repoDir,
            branch,
            changes,
            onCommit,
            onAuthFailure,
            onError
        } = this.props
        const {disabled} = this.state || {}

        return <SubmitTextDialog
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
                        author,
                        message: message
                    })
                ).then(() =>
                    git.push({
                        fs,
                        http,
                        dir: repoDir,
                        remote: 'origin',
                        ref: branch,
                        onAuth,
                        onAuthFailure,
                    })
                ).then(() => {
                    onCommit(message)
                    this.setState(state => ({...state, disabled: false}))
                }).catch(onError)
            }}/>
    }
}

export default GitCommitDialog
