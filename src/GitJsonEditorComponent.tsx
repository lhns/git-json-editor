import React from 'react'
import GitRepoComponent from './GitRepoComponent'
import JsonEditorComponent from "./JsonEditorComponent"
import {loadSchema} from "./Utils";
import ScrollPane from "./html/ScrollPane";
import * as git from "isomorphic-git";
import {GitOpts} from "./GitBranchSelectComponent";
import Alert from "./html/Alert";

class GitJsonEditorComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts
}, {
    selectedFile: string,
    schema?: string,
    data?: string,
    update: number,
    schemaError?: string,
    globalError?: string
}> {
    render() {
        const {fs, gitOpts} = this.props
        const {selectedFile, schema, data, update, schemaError, globalError} = this.state || {}

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
                        onSelect={file => {
                            this.setState(state => ({...state, selectedFile: file}))
                            const fileContent: Promise<string> = fs.promises.readFile(
                                file,
                                {encoding: 'utf8'}
                            )
                            fileContent.then(string =>
                                loadSchema(string, gitOpts.corsProxy)
                            ).then(({schema, data}) => {
                                this.setState((state) => ({
                                    ...state,
                                    schema,
                                    data,
                                    schemaError: undefined
                                }))
                            }).catch((error: Error) => {
                                console.error(error)
                                this.setState((state) => ({
                                    ...state,
                                    schema: undefined,
                                    data: undefined,
                                    schemaError: error.message
                                }))
                            })
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
                                    onChange={data => {
                                        this.setState(state => ({...state, data: data}))
                                        const string = JSON.stringify(data, null, 2)
                                        fs.promises.writeFile(
                                            selectedFile,
                                            string,
                                            {encoding: 'utf8'}
                                        ).then(() =>
                                            this.setState(state => ({...state, update: (state.update || 0) + 1}))
                                        )
                                    }
                                    }/> :
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
