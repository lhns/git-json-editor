import React from "react";
import JsonEditorComponent from "./JsonEditorComponent";
import ScrollPane from "./html/ScrollPane";
import JsonEditorTextComponent from "./JsonEditorTextComponent";
import JsonEditorListComponent from "./JsonEditorListComponent";
import {loadSchema} from "./Utils";
import {dirname} from "@isomorphic-git/lightning-fs/src/path";
import * as git from "isomorphic-git";
import {GitOpts} from "./GitBranchSelectComponent";

class JsonEditorTabsComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    filePath: string,
    data: string,
    onChange: (data: string) => void
}, {
    activeTab: string,
    jsonSchema?: unknown,
    jsonData?: unknown,
    schemaError?: string
}> {
    componentDidMount() {
        this.updateSchema()
    }

    componentDidUpdate(prevProps: any) {
        const {filePath, data} = this.props

        if (prevProps.filePath !== filePath || prevProps.data !== data) {
            this.updateSchema()
        }
    }

    updateSchema() {
        const {fs, gitOpts, filePath, data} = this.props

        Promise.resolve().then(() =>
            loadSchema(
                data,
                fs,
                dirname(filePath),
                gitOpts.corsProxy
            )
        ).then(({schema, data}) => {
            console.log("json schema " + schema)
            this.setState((state) => ({
                ...state,
                jsonSchema: schema,
                jsonData: data,
                schemaError: undefined
            }))
        }).catch((error: Error) => {
            console.error(error)
            this.setState((state) => ({
                ...state,
                jsonSchema: undefined,
                jsonData: undefined,
                schemaError: error.message
            }))
        })
    }

    render() {
        const {data, onChange} = this.props
        const {activeTab, jsonSchema, jsonData} = this.state ?? {}

        const tabs: Record<string, () => React.ReactNode> = {
            ...(jsonSchema != null ?
                {
                    "Form": () => <ScrollPane>
                        <div className="p-2">
                            <JsonEditorComponent
                                schema={jsonSchema}
                                data={jsonData}
                                onChange={(data: unknown) => {
                                    const string = JSON.stringify(data, null, 2)
                                    onChange(string)
                                }}/>
                        </div>
                    </ScrollPane>
                } :
                {}),
            ...(jsonSchema != null && jsonSchema?.type === 'object' && jsonSchema?.properties?.entries?.type === 'array' ?
                {
                    "List (beta)": () => <JsonEditorListComponent
                        schema={jsonSchema}
                        data={jsonData}
                        onChange={(data: unknown) => {
                            const string = JSON.stringify(data, null, 2)
                            onChange(string)
                        }}/>
                } :
                {}),
            "Text (beta)": () => <ScrollPane>
                <div className="p-2"><JsonEditorTextComponent
                    data={data}
                    onChange={onChange}/>
                </div>
            </ScrollPane>
        }

        const activeTabOrDefault = activeTab != null && tabs[activeTab] != null ? activeTab : Object.keys(tabs)[0]

        return <div className="d-flex flex-fill flex-column">
            <ul className="nav nav-tabs pt-1 px-1">
                {Object.entries(tabs).map(([name]) =>
                    <li className="nav-item" key={name}>
                        <a className={"nav-link" + (name == activeTabOrDefault ? " active" : "")}
                           href="#"
                           onClick={() => this.setState(state => ({...state, activeTab: name}))}>{name}</a>
                    </li>
                )}
            </ul>
            <div className="d-flex flex-fill flex-column">
                {tabs?.[activeTabOrDefault]?.()}
            </div>
        </div>
    }
}

export default JsonEditorTabsComponent
