import React from 'react'
import * as git from 'isomorphic-git'
import SelectList from './html/SelectList'
import {readDirRec, relativePath} from './Utils'
import CenteredSpinner from "./html/CenteredSpinner"

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
    private checkout(): Promise<any> {
        const {fs, repoDir, branch, initialFilePath} = this.props

        this.setState(() => ({}))
        if (fs != null && repoDir != null && branch != null) {
            this.setState(state => ({...state, loading: true}))
            return git.checkout({
                fs,
                dir: repoDir,
                ref: branch,
                force: true
            }).then(() =>
                this.refreshFiles(fs, repoDir, initialFilePath, true)
            )
        } else {
            return Promise.resolve()
        }
    }

    private refreshFiles(fs: git.PromiseFsClient,
                         repoDir: string,
                         initialFilePath: string | undefined,
                         forceSelect?: boolean): Promise<any> {
        return readDirRec(fs, repoDir).then(paths => {
            const files = paths
                .filter(e => !e.endsWith('/'))
                .sort((a, b) => a.localeCompare(b))
            const selected = initialFilePath != null && files.includes(initialFilePath) ?
                initialFilePath :
                undefined
            const prevSelected = this.state.selected
            this.setState(state => ({...state, files: files, selected, loading: false}), () => {
                if (selected != null && (selected !== prevSelected || forceSelect)) {
                    this.props.onSelect(selected)
                }
            })
        })
    }

    componentDidMount() {
        this.checkout()
            .catch(this.props.onError)
    }

    componentDidUpdate(prevProps: any) {
        const {fs, repoDir, branch, initialFilePath} = this.props

        if (fs !== prevProps.fs || repoDir !== prevProps.repoDir || branch !== prevProps.branch) {
            this.checkout()
                .catch(this.props.onError)
        } else if (initialFilePath !== prevProps.initialFilePath) {
            this.refreshFiles(fs, repoDir, initialFilePath)
                .catch(this.props.onError)
        }
    }

    private revertFile(file: string) {
        const {fs, repoDir} = this.props

        git.checkout({
            fs,
            dir: repoDir,
            force: true,
            filepaths: [relativePath(file, repoDir)]
        }).then(() =>
            this.props.onChange(file)
        )
    }

    render() {
        const {repoDir, changes} = this.props
        const {files, selected, loading} = this.state ?? {}

        return loading ?
            <CenteredSpinner/> :
            <SelectList
                items={files ?? []}
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
                    this.props.onSelect(filePath)
                }}/>
    }
}

export default GitFilesComponent
