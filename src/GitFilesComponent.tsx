import React from 'react'
import * as git from 'isomorphic-git'
import SelectList from './SelectList'
import {readDirRec} from './Utils'
import CenteredSpinner from "./CenteredSpinner";

class GitFilesComponent extends React.Component<{
    fs: git.PromiseFsClient,
    repoDir: string,
    branch: string,
    changes: [string, boolean][],
    onSelect: (file: string) => void,
    onError: (error: Error) => void
}, {
    files?: string[],
    loading: boolean
}> {
    private checkout() {
        const {fs, repoDir, branch, onError} = this.props
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
                    this.setState(state => ({...state, files: files, loading: false}))
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

    componentWillUnmount() {
    }

    render() {
        const {repoDir, changes, onSelect} = this.props
        const {files, loading} = this.state || {}
        const pathPrefix = repoDir != null ? repoDir.replace(/\/?$/, '/') : ''
        return loading ?
            <CenteredSpinner/> :
            <SelectList
                items={files || []}
                render={e => {
                    const fileName = e.substring(pathPrefix.length)
                    const changed = changes.some(([file]) => pathPrefix + file === e)
                    if (changed) {
                        return <div className="fst-italic">{fileName} *</div>
                    } else {
                        return <div>{fileName}</div>
                    }
                }}
                onSelect={onSelect}/>
    }
}

export default GitFilesComponent
