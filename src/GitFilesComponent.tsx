import React from 'react'
import * as git from 'isomorphic-git'
import SelectList from './html/SelectList'
import {readDirRec, relativePath} from './Utils'
import CenteredSpinner from "./html/CenteredSpinner";

class GitFilesComponent extends React.Component<{
    fs: git.PromiseFsClient,
    repoDir: string,
    branch: string,
    changes: [string, boolean][],
    initialFilePath?: string,
    onSelect: (file: string) => void,
    onChange: (file: string) => void,
    onError: (error: Error) => void
}, {
    files?: string[],
    selected?: string,
    loading: boolean
}> {
    private checkout() {
        const {fs, repoDir, branch, initialFilePath, onSelect, onError} = this.props

        this.setState(() => ({}))
        if (fs != null && repoDir != null && branch != null) {
            this.setState(state => ({...state, loading: true}))
            git.checkout({
                fs,
                dir: repoDir,
                ref: branch,
                force: true
            })
                .then(() => readDirRec(fs, repoDir))
                .then(paths => {
                    const files = paths
                        .filter(e => !e.endsWith('/'))
                        .sort((a, b) => a.localeCompare(b))
                    const selected = initialFilePath != null && files.includes(initialFilePath) ?
                        initialFilePath :
                        undefined
                    this.setState(state => ({...state, files: files, selected, loading: false}), () => {
                        if (selected != null) {
                            onSelect(selected)
                        }
                    })
                })
                .catch(onError)
        }
    }

    componentDidMount() {
        this.checkout()
    }

    componentDidUpdate(prevProps: any) {
        const {fs, repoDir, branch} = this.props

        if (fs !== prevProps.fs || repoDir !== prevProps.repoDir || branch !== prevProps.branch) {
            this.checkout()
        }
    }

    private revertFile(file: string) {
        const {fs, repoDir, onChange} = this.props

        git.checkout({
            fs,
            dir: repoDir,
            force: true,
            filepaths: [relativePath(file, repoDir)]
        }).then(() => onChange(file))
    }

    render() {
        const {repoDir, changes, onSelect} = this.props
        const {files, selected, loading} = this.state || {}

        return loading ?
            <CenteredSpinner/> :
            <SelectList
                items={files || []}
                selected={selected}
                render={filePath => {
                    const file = relativePath(filePath, repoDir)
                    const changed = changes.some(([changedFile]) => changedFile === file)
                    if (changed) {
                        return <div className="fst-italic">
                            {file} * <i className="revert-button oi oi-action-undo"
                                        onClick={event => {
                                            event.stopPropagation()
                                            this.revertFile(filePath)
                                        }}/>
                        </div>
                    } else {
                        return <div>{file}</div>
                    }
                }}
                onSelect={filePath => {
                    this.setState(state => ({...state, selected: filePath}))
                    onSelect(filePath)
                }}/>
    }
}

export default GitFilesComponent
