import React from 'react'
import GitRepoComponent from './GitRepoComponent'
import {relativePath} from "./Utils"
import * as git from "isomorphic-git"
import {GitOpts} from "./GitBranchSelectComponent"
import Alert from "./html/Alert"
import {v4 as uuidv4} from "uuid"
import {GitPlatform} from "./GitPlatform"
import JsonEditorTabsComponent from "./JsonEditorTabsComponent";

class GitJsonEditorComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    gitPlatform: GitPlatform
}, {
    changeId?: string,
    selectedFile?: string,
    data?: string,
    update: number,
    schemaError?: string,
    globalError?: string
}> {
    render() {
        const {fs, gitOpts, gitPlatform} = this.props
        const {selectedFile, data, update, schemaError, globalError} = this.state ?? {}

        const params = new URL(window.location.href).searchParams
        const initialBranch: string | null = params.get('branch')
        const initialFile: string | null = params.get('file')

        if (globalError != null) {
            return <div className="p-3">
                <Alert>
                    <pre>{globalError}</pre>
                </Alert>
            </div>
        } else {
            return <div className="h-100 d-flex flex-row">
                <div className="git-panel separator-right h-100">
                    <GitRepoComponent
                        fs={fs}
                        gitOpts={gitOpts}
                        gitPlatform={gitPlatform}
                        update={update}
                        initialBranch={initialBranch ?? undefined}
                        initialFile={initialFile ?? undefined}
                        onSelect={(filePath, repoDir) => {
                            const newUrl = new URL(window.location.href)
                            newUrl.searchParams.set('file', relativePath(filePath, repoDir))
                            window.history.replaceState(null, document.title, newUrl.href)

                            const changeId = uuidv4()
                            const fileContent: Promise<string> = fs.promises.readFile(
                                filePath,
                                {encoding: 'utf8'}
                            )
                            new Promise((resolve: any) =>
                                this.setState(state => ({...state, changeId}), resolve)
                            ).then(() =>
                                fileContent
                            ).then((data) =>
                                this.setState((state) => state.changeId === changeId ? ({
                                    ...state,
                                    selectedFile: filePath,
                                    data
                                }) : state)
                            ).catch((error: Error) => {
                                console.error(error)
                                this.setState((state) => state.changeId === changeId ? ({
                                    ...state,
                                    selectedFile: undefined,
                                    data: undefined
                                }) : state)
                            })
                        }}
                        onBranchSelect={branch => {
                            const newUrl = new URL(window.location.href)
                            newUrl.searchParams.set('branch', branch)
                            window.history.replaceState(null, document.title, newUrl.href)
                        }}
                        onAuthFailure={url => console.warn("git: failed to authenticate: " + url)}
                        onError={error => {
                            console.error(error)
                            this.setState(state => ({...state, globalError: error.stack}))
                        }}/>
                </div>
                <div className="flex-fill d-flex flex-column">
                    {selectedFile != null && data != null ?
                        <JsonEditorTabsComponent
                            fs={fs}
                            gitOpts={gitOpts}
                            filePath={selectedFile}
                            data={data}
                            onChange={(data: string) => {
                                this.setState(state => ({...state, data: data}))
                                if (selectedFile != null) {
                                    fs.promises.writeFile(
                                        selectedFile,
                                        data,
                                        {encoding: 'utf8'}
                                    ).then(() =>
                                        this.setState(state => ({...state, update: (state.update ?? 0) + 1}))
                                    )
                                }
                            }}/> :
                        schemaError != null ?
                            <div className="flex-fill p-2">
                                <Alert>
                                    <pre>{schemaError}</pre>
                                </Alert>
                            </div> :
                            null}
                </div>
            </div>
        }
    }
}

export default GitJsonEditorComponent
