import React from 'react'
import * as git from 'isomorphic-git'
import ScrollPane from "./html/ScrollPane"
import GitFilesComponent from "./GitFilesComponent"
import GitBranchSelectComponent, {GitOpts} from "./GitBranchSelectComponent"
import GitCommitDialog from "./GitCommitDialog"
import {resolvePath} from "./Utils"
import {GitPlatform} from "./GitPlatform"

class GitRepoComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    gitPlatform: GitPlatform,
    update?: any,
    initialBranch?: string,
    initialFile?: string,
    onSelect: (filePath: string, repoDir: string) => void,
    onBranchSelect?: (branch: string) => void,
    onAuthFailure: (url: string) => void,
    onError: (error: Error) => void
}, {
    repoDir: string,
    branch: string,
    changes?: [string, boolean][]
    selectedFilePath?: string,
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
        const {fs, gitOpts, initialBranch, initialFile, onSelect, onBranchSelect, onAuthFailure, onError} = this.props
        const {repoDir, branch, changes, selectedFilePath} = this.state || {}

        return <div className="h-100 d-flex flex-column gap-1">
            <div className="git-repo-title">
                <a href={gitOpts.url}>{gitOpts.url}</a>
            </div>
            <div className="px-1">
                <GitBranchSelectComponent
                    fs={fs}
                    gitOpts={gitOpts}
                    initialBranch={initialBranch}
                    onSelect={(branch, repoDir) => {
                        if (onBranchSelect != null) {
                            onBranchSelect(branch)
                        }
                        this.setState(state => ({
                            ...state,
                            repoDir: repoDir,
                            branch: branch,
                            selectedFilePath: undefined
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
                        initialFilePath={selectedFilePath || (initialFile != null ? resolvePath(repoDir, initialFile) : undefined)}
                        onSelect={filePath => {
                            this.setState(state => ({...state, selectedFilePath: filePath}))
                            onSelect(filePath, repoDir)
                        }}
                        onChange={() => {
                            this.getChanges()
                            if (selectedFilePath != null) {
                                onSelect(selectedFilePath, repoDir)
                            }
                        }}
                        onError={onError}/>
                </ScrollPane>
            </div>
            <div className="px-1 pb-1">
                <GitCommitDialog
                    fs={fs}
                    gitOpts={gitOpts}
                    repoDir={repoDir}
                    changes={changes || []}
                    onCommit={(_, commitBranch) => {
                        this.getChanges()
                        const newUrl = this.props.gitPlatform.getMergeRequestUrl(gitOpts.url, commitBranch, branch)
                        if (newUrl != null) {
                            window.location.assign(newUrl)
                        }
                    }}
                    onAuthFailure={onAuthFailure}
                    onError={onError}/>
            </div>
        </div>
    }
}

export default GitRepoComponent
