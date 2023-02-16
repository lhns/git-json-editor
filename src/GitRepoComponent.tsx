import React from 'react'
import * as git from 'isomorphic-git'
import ScrollPane from "./ScrollPane";
import GitFilesComponent from "./GitFilesComponent";
import GitBranchSelectComponent, {GitCloneOpts} from "./GitBranchSelectComponent";
import GitCommitDialog from "./GitCommitDialog";

class GitRepoComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitCloneOpts: GitCloneOpts,
    onSelect: (file: string) => void,
    onError: (error: Error) => void
}, {
    repoDir: string,
    branch: string
}> {
    render() {
        const {fs, gitCloneOpts, onSelect, onError} = this.props
        const {repoDir, branch} = this.state || {}
        return <div className="h-100 d-flex flex-column p-1 gap-1">
            <GitBranchSelectComponent
                fs={fs}
                gitCloneOpts={gitCloneOpts}
                onSelect={(branch, repoDir) => {
                    this.setState(state => ({
                        ...state,
                        repoDir: repoDir,
                        branch: branch
                    }))
                }}
                onError={onError}/>
            <div className="flex-fill d-flex flex-column">
                <ScrollPane>
                    <GitFilesComponent
                        fs={fs}
                        repoDir={repoDir}
                        branch={branch}
                        onSelect={file => {
                            this.setState(state => ({...state, selectedFile: file}))
                            onSelect(file)
                        }}
                        onError={onError}/>
                </ScrollPane>
            </div>
            <div>
                <GitCommitDialog
                    fs={fs}
                    gitCloneOpts={gitCloneOpts}
                    branch={branch}
                    repoDir={repoDir}
                    onCommit={message => console.log(message)}
                    onError={onError}/>
            </div>
        </div>
    }
}

export default GitRepoComponent
