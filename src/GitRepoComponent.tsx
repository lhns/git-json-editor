import React from 'react'
import * as git from 'isomorphic-git'
import ScrollPane from "./ScrollPane";
import GitFilesComponent from "./GitFilesComponent";
import GitBranchSelectComponent, {GitCloneOpts} from "./GitBranchSelectComponent";
import GitCommitDialog from "./GitCommitDialog";

class GitRepoComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitCloneOpts: GitCloneOpts,
    update?: any,
    onSelect: (file: string) => void,
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
        const {fs, gitCloneOpts, onSelect, onError} = this.props
        const {repoDir, branch, changes, selectedFile} = this.state || {}
        return <div className="h-100 d-flex flex-column p-1 gap-1">
            <GitBranchSelectComponent
                fs={fs}
                gitCloneOpts={gitCloneOpts}
                onSelect={(branch, repoDir) => {
                    this.setState(state => ({
                        ...state,
                        repoDir: repoDir,
                        branch: branch,
                        selectedFile: undefined
                    }))
                }}
                onError={onError}/>
            <div className="flex-fill d-flex flex-column">
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
            <div>
                <GitCommitDialog
                    fs={fs}
                    gitCloneOpts={gitCloneOpts}
                    branch={branch}
                    repoDir={repoDir}
                    changes={changes || []}
                    onCommit={() => this.getChanges()}
                    onError={onError}/>
            </div>
        </div>
    }
}

export default GitRepoComponent
