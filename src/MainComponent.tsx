import React from 'react'
import GitFileListComponent from './GitFileListComponent'
import type {GitOpts} from './GitFileListComponent'
import JsonEditorComponent from "./JsonEditorComponent"

class MainComponent extends React.Component<{ gitOpts: GitOpts }, {
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
                <div className="overflow-auto h-100" style={{
                    width: '18em',
                    borderRight: '1px solid var(--bs-gray-400)'
                }}>
                    <GitFileListComponent gitOpts={this.props.gitOpts}
                                          onSelect={string => {
                                              Promise.resolve(null)
                                                  .then(() => {
                                                      const data = JSON.parse(string)
                                                      const ref = data['$ref']
                                                      if (ref == null) throw new Error('$ref is not defined')
                                                      const withCorsProxy = (url: string) =>
                                                          this.props.gitOpts.corsProxy ? this.props.gitOpts.corsProxy
                                                                  .replace(/\/?$/, '/') +
                                                              url.replace(/^https?:\/\//, '') : url

                                                      return fetch(withCorsProxy(ref))
                                                          .then((response) => response.json())
                                                          .then(schema => this.setState((state) => ({
                                                              ...state,
                                                              schema: schema,
                                                              data: data,
                                                              schemaError: undefined
                                                          })))
                                                  })
                                                  .catch(error => {
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
                <div className="overflow-auto flex-fill">
                    {this.state?.schema != null ?
                        <JsonEditorComponent schema={this.state.schema} data={this.state.data}/> :
                        this.state?.schemaError != null ?
                            <div className="p-2">
                                <div className="alert alert-danger" role="alert">
                                    {this.state.schemaError}
                                </div>
                            </div> :
                            null}
                </div>
            </div>
        }
    }
}

export default MainComponent
