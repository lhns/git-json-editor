import React from 'react'
import GitRepoComponent from './GitRepoComponent'
import JsonEditorComponent from "./JsonEditorComponent"
import {loadSchema, relativePath} from "./Utils";
import ScrollPane from "./html/ScrollPane";
import * as git from "isomorphic-git";
import {GitOpts} from "./GitBranchSelectComponent";
import Alert from "./html/Alert";

class GitJsonEditorComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts
}, {
    selectedFile?: string,
    schema?: string,
    data?: string,
    update: number,
    schemaError?: string,
    globalError?: string
}> {
    render() {
        const {fs, gitOpts} = this.props
        const {selectedFile, schema, data, update, schemaError, globalError} = this.state || {}

        const params = new URL(window.location.href).searchParams
        const initialBranch: string | null = params.get('branch')
        const initialFile: string | null = params.get('file')

        if (globalError != null) {
            return <div className="p-3">
                <Alert>
                    {globalError}
                </Alert>
            </div>
        } else {
            return <div className="h-100 d-flex flex-row">
                <div className="git-panel h-100">
                    <GitRepoComponent
                        fs={fs}
                        gitOpts={gitOpts}
                        update={update}
                        initialBranch={initialBranch || undefined}
                        initialFile={initialFile || undefined}
                        onSelect={(file, repoDir) => {
                            const newUrl = new URL(window.location.href)
                            newUrl.searchParams.set('file', relativePath(file, repoDir))
                            window.history.replaceState(null, document.title, newUrl.href)

                            const fileContent: Promise<string> = fs.promises.readFile(
                                file,
                                {encoding: 'utf8'}
                            )
                            fileContent.then(string =>
                                loadSchema(string, gitOpts.corsProxy)
                            ).then(({schema, data}) => {
                                this.setState((state) => ({
                                    ...state,
                                    selectedFile: data != null ? file : undefined,
                                    schema,
                                    data,
                                    schemaError: undefined
                                }))
                            }).catch((error: Error) => {
                                console.error(error)
                                this.setState((state) => ({
                                    ...state,
                                    selectedFile: undefined,
                                    schema: undefined,
                                    data: undefined,
                                    schemaError: error.message
                                }))
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
                                        {schemaError}
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
