import React from 'react'
import GitFileListComponent from './GitFileListComponent'
import GitOpts from './GitFileListComponent'
import JsonEditorComponent from "./JsonEditorComponent";

class MainComponent extends React.Component<{ gitOpts: GitOpts }, { schema: string }> {
    render() {
        return <div className="h-100 d-flex flex-row gap-2">
            <div className="overflow-auto h-100" style={{
                width: '18em',
                borderRight: '1px solid var(--bs-gray-400)'
            }}>
                <GitFileListComponent gitOpts={this.props.gitOpts}
                                      onSelect={schemaString => this.setState((state) => {
                                          let schema = null
                                          try {
                                              schema = JSON.parse(schemaString)
                                          } catch (e) {
                                          }
                                          return {...state, schema: schema}
                                      })}/>
            </div>
            <div className="overflow-auto flex-fill">
                {this.state?.schema == null ? null : <JsonEditorComponent schema={this.state.schema}/>}
            </div>
        </div>
    }
}

export default MainComponent
