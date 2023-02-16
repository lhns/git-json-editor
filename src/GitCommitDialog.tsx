import React from 'react'
import * as git from 'isomorphic-git'
import {v4 as uuidv4} from "uuid"
import SelectList from './SelectList'
import {readDirRec} from './Utils'
import CommitDialog from "./CommitDialog";
import {GitCloneOpts} from "./GitBranchSelectComponent";

class GitCommitDialog extends React.Component<{
    fs: git.PromiseFsClient,
    gitCloneOpts: GitCloneOpts,
    repoDir: string,
    branch: string,
    disabled?: boolean,
    onCommit: (message: string) => void,
    onError: (error: Error) => void
}> {
    render() {
        const {fs, gitCloneOpts: {http, auth}, repoDir, branch, disabled, onCommit, onError} = this.props
        return <CommitDialog
            disabled={disabled}
            onCommit={message => {
                git.commit({
                    fs,
                    dir: repoDir,
                    author: {
                        name: 'Test',
                        email: 'test@example.com',
                    },
                    message: message
                })
                    .then(() =>
                        git.push({
                            fs,
                            http,
                            dir: repoDir,
                            remote: 'origin',
                            ref: branch,
                            onAuth: () => auth,
                        })
                    )
                    .catch(onError)
            }}/>
    }
}

export default GitCommitDialog
