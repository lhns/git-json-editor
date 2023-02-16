import React from 'react'
import GitRepoComponent from './GitRepoComponent'
import JsonEditorComponent from "./JsonEditorComponent"
import {isMetaSchemaUrl, withCorsProxy} from "./Utils";
import ScrollPane from "./ScrollPane";
import * as git from "isomorphic-git";
import {GitCloneOpts} from "./GitBranchSelectComponent";

class MainComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitCloneOpts: GitCloneOpts
}, {
    selectedFile: string,
    schema?: string,
    data?: string,
    update: number,
    schemaError?: string,
    globalError?: string
}> {
    render() {
        const {fs, gitCloneOpts} = this.props
        const {selectedFile, schema, data, update, schemaError, globalError} = this.state || {}
        if (globalError != null) {
            return <div className="p-3">
                <div className="alert alert-danger" role="alert">
                    {globalError}
                </div>
            </div>
        } else {
            return <div className="h-100 d-flex flex-row">
                <div className="h-100" style={{
                    width: '18em',
                    borderRight: '1px solid var(--bs-gray-400)'
                }}>
                    <GitRepoComponent
                        fs={fs}
                        gitCloneOpts={gitCloneOpts}
                        update={update}
                        onSelect={file => {
                            this.setState(state => ({...state, selectedFile: file}))
                            fs.promises.readFile(
                                file,
                                {encoding: 'utf8'}
                            ).then((string: string) => {
                                const loadJsonEditor = (schema: string, data?: string) => {
                                    return this.setState((state) => ({
                                        ...state,
                                        schema: schema,
                                        data: data,
                                        schemaError: undefined
                                    }))
                                }
                                const data = JSON.parse(string)
                                const schemaUrl = data['$schema']
                                if (schemaUrl == null) {
                                    throw new Error('$schema is not defined')
                                } else if (isMetaSchemaUrl(schemaUrl)) {
                                    return loadJsonEditor(data, undefined)
                                } else {
                                    return fetch(withCorsProxy(schemaUrl, gitCloneOpts.corsProxy))
                                        .then((response) => response.json())
                                        .then(schema => loadJsonEditor(schema, data))
                                }
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
                                    <div className="alert alert-danger" role="alert">
                                        {schemaError}
                                    </div> :
                                    null}
                        </div>
                    </ScrollPane>
                </div>
            </div>
        }
    }
}

export default MainComponent
