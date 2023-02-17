import React from 'react'
import * as git from 'isomorphic-git'
import ScrollPane from "./html/ScrollPane";
import GitFilesComponent from "./GitFilesComponent";
import GitBranchSelectComponent, {GitOpts} from "./GitBranchSelectComponent";
import GitCommitDialog from "./GitCommitDialog";

class GitRepoComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    update?: any,
    onSelect: (file: string) => void,
    onAuthFailure: (url: string) => void,
    onError: (error: Error) => void
}, {
    repoDir: string,
    branch: string,
    changes?: [string, boolean][]
    selectedFile?: string,
}> {
    private getChanges() {
        const {fs, onError} = this.props
        const {repoDir} = this.state || {}
        this.setState(state => ({...state, changes: undefined}))
        if (fs != null && repoDir != null) {
            git.statusMatrix({
                fs,
                dir: repoDir
            }).then(status => {
                const changes: [string, boolean][] = status.flatMap(([file, , status]) =>
                    status == 1 ? [] : [[file, status != 0]]
                )
                this.setState(state => ({...state, changes: changes}))
            }).catch(onError)
        }
    }

    componentDidMount() {
        this.getChanges()
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.update !== prevProps.update) {
            this.getChanges()
        }
    }

    render() {
        const {fs, gitOpts, onSelect, onAuthFailure, onError} = this.props
        const {repoDir, branch, changes, selectedFile} = this.state || {}

        return <div className="h-100 d-flex flex-column gap-1">
            <div className="git-repo-title">
                <a href={gitOpts.url}>{gitOpts.url}</a>
            </div>
            <div className="px-1">
                <GitBranchSelectComponent
                    fs={fs}
                    gitOpts={gitOpts}
                    onSelect={(branch, repoDir) => {
                        this.setState(state => ({
                            ...state,
                            repoDir: repoDir,
                            branch: branch,
                            selectedFile: undefined
                        }))
                    }}
                    onAuthFailure={onAuthFailure}
                    onError={onError}/>
            </div>
            <div className="flex-fill d-flex flex-column px-1">
                <ScrollPane>
                    <GitFilesComponent
                        fs={fs}
                        repoDir={repoDir}
                        branch={branch}
                        changes={changes || []}
                        onSelect={file => {
                            this.setState(state => ({...state, selectedFile: file}))
                            onSelect(file)
                        }}
                        onChange={() => {
                            this.getChanges()
                            if (selectedFile != null) onSelect(selectedFile)
                        }}
                        onError={onError}/>
                </ScrollPane>
            </div>
            <div className="px-1 pb-1">
                <GitCommitDialog
                    fs={fs}
                    gitOpts={gitOpts}
                    branch={branch}
                    repoDir={repoDir}
                    changes={changes || []}
                    onCommit={() => this.getChanges()}
                    onAuthFailure={onAuthFailure}
                    onError={onError}/>
            </div>
        </div>
    }
}

export default GitRepoComponent
