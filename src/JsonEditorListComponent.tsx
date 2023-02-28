import React from "react"
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism.css'
import JsonEditorComponent from "./JsonEditorComponent";
import ScrollPane from "./html/ScrollPane";

class JsonEditorListComponent extends React.Component<{
    schema: any,
    data?: any,
    onChange: (data: any) => void
}, {
    selectedIndex: number
}> {
    render() {
        const {schema, data, onChange} = this.props
        const {selectedIndex} = this.state ?? {}

        const entries: any[] = Array.isArray(data?.entries) ? data.entries : []

        return <div className="flex-fill d-flex flex-column">
            <div className="flex-fill separator-bottom">
                <ScrollPane>
                    <div className="p-2">
                        {(() => {
                            const headerFields: string[] = schema?.properties?.entries?.items?.headerFields ?? []
                            return <table className="table table-sm table-hover">
                                <thead style={{
                                    position: 'sticky',
                                    top: '0px',
                                    backgroundColor: 'white'
                                }}>
                                <tr>
                                    {headerFields.map(field => <th key={field}>{field}</th>)}
                                </tr>
                                </thead>
                                <tbody>
                                {entries.map((entry, i) => {
                                    const isSelected = selectedIndex === i
                                    return <tr
                                        key={i + '=' + JSON.stringify(entry)}
                                        onClick={() => {
                                            this.setState(state => ({...state, selectedIndex: i}))
                                        }}
                                        className={'mx-2' + (isSelected ? ' table-active' : '')}
                                        style={{cursor: 'pointer'}}>
                                        {headerFields.map(field => <td
                                            key={field}>{(entry[field] ?? '').toString()}</td>)}
                                    </tr>
                                })}
                                </tbody>
                            </table>
                        })()}
                    </div>
                </ScrollPane>
            </div>
            <div className="flex-fill list-json-editor-panel">
                <ScrollPane>
                    <div className="p-2">
                        {selectedIndex != null && (data?.entries ?? [])[selectedIndex] ?
                            <JsonEditorComponent
                                schema={{$schema: schema?.$schema, ...(schema?.properties?.entries?.items ?? {})}}
                                data={(data?.entries ?? [])[selectedIndex]}
                                onChange={entryData => onChange({
                                    ...data,
                                    entries: (data?.entries ?? []).map((entry: any, i: number) => selectedIndex == i ? entryData : entry)
                                })}/> :
                            null}
                    </div>
                </ScrollPane>
            </div>
        </div>
    }
}

export default JsonEditorListComponent
