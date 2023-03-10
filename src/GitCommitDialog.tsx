import React from 'react'
import * as git from 'isomorphic-git'
import CommitDialog from "./html/CommitDialog"
import {GitOpts} from "./GitBranchSelectComponent"

class GitCommitDialog extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    repoDir: string,
    branch: string,
    changes: [string, boolean][],
    onCommit: (message: string, branch: string) => void,
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
        const {disabled} = this.state ?? {}

        return <CommitDialog
            action={`Commit (${changes.length})`}
            placeholderMessage="Commit Message"
            placeholderBranch="Branch"
            disabled={disabled || changes.length == 0}
            onConfirm={(message, commitBranch) => {
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
                        message: message,
                    })
                ).then(() =>
                    git.listBranches({
                        fs,
                        dir: repoDir,
                        remote: 'origin'
                    })
                ).then(branches => {
                    let newBranch = commitBranch
                    if (commitBranch !== branch && branches.includes(commitBranch)) {
                        let i = 2
                        for (; branches.includes(commitBranch + '-' + i); i++) {
                        }
                        newBranch = commitBranch + '-' + i
                    }

                    return git.push({
                        fs,
                        http,
                        dir: repoDir,
                        remote: 'origin',
                        remoteRef: 'refs/heads/' + newBranch,
                        onAuth,
                        onAuthFailure,
                    }).then(() => {
                        onCommit(message, newBranch)
                        this.setState(state => ({...state, disabled: false}))
                    })
                }).catch(onError)
            }}/>
    }
}

export default GitCommitDialog
