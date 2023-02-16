import React from 'react'
import GitFileListComponent from './GitFileListComponent'
import type {GitOpts} from './GitFileListComponent'
import JsonEditorComponent from "./JsonEditorComponent"
import {isMetaSchemaUrl, withCorsProxy} from "./Utils";
import ScrollPane from "./ScrollPane";

class MainComponent extends React.Component<{ gitOpts: GitOpts }, {
    selectedFile: string,
    schema?: string,
    data?: string,
    schemaError?: string,
    globalError?: string
}> {
    render() {
        if (this.state?.globalError != null) {
            return <div className="p-3">
                <div className="alert alert-danger" role="alert">
                    {this.state.globalError}
                </div>
            </div>
        } else {
            return <div className="h-100 d-flex flex-row gap-2">
                <div className="h-100" style={{
                    width: '18em',
                    borderRight: '1px solid var(--bs-gray-400)'
                }}>
                    <GitFileListComponent gitOpts={this.props.gitOpts}
                                          onSelect={file => {
                                              this.setState(state => ({...state, selectedFile: file}))
                                              this.props.gitOpts.fs.promises.readFile(file, {encoding: 'utf8'})
                                                  .then((string: string) => {
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
                                                          return fetch(withCorsProxy(schemaUrl, this.props.gitOpts.corsProxy))
                                                              .then((response) => response.json())
                                                              .then(schema => loadJsonEditor(schema, data))
                                                      }
                                                  })
                                                  .catch((error: Error) => {
                                                      console.error(error)
                                                      this.setState((state) => ({
                                                          ...state,
                                                          schema: undefined,
                                                          data: undefined,
                                                          schemaError: error.message
                                                      }))
                                                  })
                                          }}
                                          onError={error =>
                                              this.setState(state => ({...state, globalError: error.stack}))
                                          }/>
                </div>
                <div className="flex-fill">
                    <ScrollPane>
                        {this.state?.schema != null ?
                            <JsonEditorComponent schema={this.state.schema}
                                                 data={this.state.data}
                                                 onChange={data => {
                                                     const string = JSON.stringify(data, null, 2)
                                                     console.log(string)
                                                     this.props.gitOpts.fs.promises.writeFile(
                                                         this.state.selectedFile,
                                                         string,
                                                         {encoding: 'utf8'}
                                                     )
                                                 }
                                                 }/> :
                            this.state?.schemaError != null ?
                                <div className="p-2">
                                    <div className="alert alert-danger" role="alert">
                                        {this.state.schemaError}
                                    </div>
                                </div> :
                                null}
                    </ScrollPane>
                </div>
            </div>
        }
    }
}

export default MainComponent
