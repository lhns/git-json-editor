import React from 'react'
import GitRepoComponent from './GitRepoComponent'
import JsonEditorComponent from "./JsonEditorComponent"
import {loadSchema, relativePath} from "./Utils"
import ScrollPane from "./html/ScrollPane"
import * as git from "isomorphic-git"
import {GitOpts} from "./GitBranchSelectComponent"
import Alert from "./html/Alert"
import {v4 as uuidv4} from "uuid"
import {GitPlatform} from "./GitPlatform"
import {dirname} from "@isomorphic-git/lightning-fs/src/path";

class GitJsonEditorComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    gitPlatform: GitPlatform
}, {
    changeId?: string,
    selectedFile?: string,
    schema?: string,
    data?: string,
    update: number,
    schemaError?: string,
    globalError?: string
}> {
    render() {
        const {fs, gitOpts, gitPlatform} = this.props
        const {selectedFile, schema, data, update, schemaError, globalError} = this.state || {}

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
                <div className="git-panel h-100">
                    <GitRepoComponent
                        fs={fs}
                        gitOpts={gitOpts}
                        gitPlatform={gitPlatform}
                        update={update}
                        initialBranch={initialBranch || undefined}
                        initialFile={initialFile || undefined}
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
                            ).then((string) =>
                                loadSchema(
                                    string,
                                    fs,
                                    dirname(filePath),
                                    gitOpts.corsProxy
                                )
                            ).then(({schema, data}) => {
                                this.setState((state) => state.changeId === changeId ? ({
                                    ...state,
                                    selectedFile: data != null ? filePath : undefined,
                                    schema,
                                    data,
                                    schemaError: undefined
                                }) : state)
                            }).catch((error: Error) => {
                                console.error(error)
                                this.setState((state) => state.changeId === changeId ? ({
                                    ...state,
                                    selectedFile: undefined,
                                    schema: undefined,
                                    data: undefined,
                                    schemaError: error.message
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
                <div className="flex-fill">
                    <ScrollPane>
                        <div className="p-2">
                            {schema != null ?
                                <JsonEditorComponent
                                    schema={schema}
                                    data={data}
                                    onChange={(data: any) => {
                                        this.setState(state => ({...state, data: data}))
                                        if (selectedFile != null) {
                                            const string = JSON.stringify(data, null, 2)
                                            fs.promises.writeFile(
                                                selectedFile,
                                                string,
                                                {encoding: 'utf8'}
                                            ).then(() =>
                                                this.setState(state => ({...state, update: (state.update || 0) + 1}))
                                            )
                                        }
                                    }}/> :
                                schemaError != null ?
                                    <Alert>
                                        <pre>{schemaError}</pre>
                                    </Alert> :
                                    null}
                        </div>
                    </ScrollPane>
                </div>
            </div>
        }
    }
}

export default GitJsonEditorComponent
