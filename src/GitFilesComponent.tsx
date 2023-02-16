import React from 'react'
import * as git from 'isomorphic-git'
import SelectList from './SelectList'
import {readDirRec} from './Utils'
import CenteredSpinner from "./CenteredSpinner";

class GitFilesComponent extends React.Component<{
    fs: git.PromiseFsClient,
    repoDir: string,
    branch: string,
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
        if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
            this.checkout()
        }
    }

    componentWillUnmount() {
    }

    render() {
        const {repoDir, onSelect} = this.props
        const {files, loading} = this.state || {}
        const pathPrefixLength = repoDir != null ? repoDir.replace(/\/?$/, '/').length : 0
        return loading ?
            <CenteredSpinner/> :
            <SelectList
                items={files || []}
                render={e => e.substring(pathPrefixLength)}
                onSelect={onSelect}/>

    }
}

export default GitFilesComponent
