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
                                    <th className="align-middle" style={{width: 0}}>
                                        <div className="d-flex flex-row align-items-center justify-content-end gap-2">
                                            <i className="list-button oi oi-plus"
                                               onClick={event => {
                                                   event.stopPropagation()
                                                   onChange({
                                                       ...data,
                                                       entries: (data?.entries ?? []).concat([{}])
                                                   })
                                               }}/>
                                        </div>
                                    </th>
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
                                        <td className="align-middle">
                                            <div
                                                className="d-flex flex-row align-items-center justify-content-end gap-2">
                                                {i > 0 ?
                                                    <i className="list-button oi oi-caret-top"
                                                       onClick={event => {
                                                           event.stopPropagation()
                                                           onChange({
                                                               ...data,
                                                               entries: (() => {
                                                                   const entries = (data?.entries ?? [])
                                                                   let moveEntry: any = null
                                                                   return entries.flatMap((entry: any, index: number) => {
                                                                       if (moveEntry != null) {
                                                                           const insertEntry = moveEntry
                                                                           moveEntry = null
                                                                           return [entry, insertEntry]
                                                                       } else if (index == i - 1) {
                                                                           moveEntry = entry
                                                                           return []
                                                                       } else {
                                                                           return [entry]
                                                                       }
                                                                   })
                                                               })()
                                                           })
                                                       }}/> : null}
                                                {i + 1 < entries.length ?
                                                    <i className="list-button oi oi-caret-bottom"
                                                       onClick={event => {
                                                           event.stopPropagation()
                                                           onChange({
                                                               ...data,
                                                               entries: (() => {
                                                                   const entries = (data?.entries ?? [])
                                                                   let moveEntry: any = null
                                                                   return entries.flatMap((entry: any, index: number) => {
                                                                       if (moveEntry != null) {
                                                                           const insertEntry = moveEntry
                                                                           moveEntry = null
                                                                           return [entry, insertEntry]
                                                                       } else if (index == i) {
                                                                           moveEntry = entry
                                                                           return []
                                                                       } else {
                                                                           return [entry]
                                                                       }
                                                                   })
                                                               })()
                                                           })
                                                       }}/> : null}
                                                <i className="list-button oi oi-layers"
                                                   onClick={event => {
                                                       event.stopPropagation()
                                                       onChange({
                                                           ...data,
                                                           entries: (data?.entries ?? []).flatMap((entry: any, index: number) => index == i ? [entry, entry] : entry)
                                                       })
                                                   }}/>
                                                <i className="list-button oi oi-trash"
                                                   onClick={event => {
                                                       event.stopPropagation()
                                                       onChange({
                                                           ...data,
                                                           entries: (data?.entries ?? []).filter((entry: any, index: number) => index != i)
                                                       })
                                                   }}/>
                                            </div>
                                        </td>
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
                        {selectedIndex != null && data?.entries?.[selectedIndex] != null ?
                            <JsonEditorComponent
                                schema={{$schema: schema?.$schema, ...(schema?.properties?.entries?.items ?? {})}}
                                data={data?.entries?.[selectedIndex]}
                                onChange={entryData => onChange({
                                    ...data,
                                    entries: (data?.entries ?? []).map((entry: any, i: number) =>
                                        selectedIndex == i ?
                                            {...entryData, $schema: undefined} :
                                            entry
                                    )
                                })}/> :
                            null}
                    </div>
                </ScrollPane>
            </div>
        </div>
    }
}

export default JsonEditorListComponent
