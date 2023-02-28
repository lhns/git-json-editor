import React from "react";
import JsonEditorComponent from "./JsonEditorComponent";
import ScrollPane from "./html/ScrollPane";
import JsonEditorTextComponent from "./JsonEditorTextComponent";
import JsonEditorListComponent from "./JsonEditorListComponent";

class JsonEditorTabsComponent extends React.Component<{
    schema: any,
    data?: any,
    onChange: (data: any) => void
}, {
    activeTab: string
}> {
    render() {
        const {schema, data, onChange} = this.props
        const {activeTab} = this.state ?? {}

        const tabs: Record<string, () => React.ReactNode> = {
            "Form": () => <ScrollPane>
                <div className="p-2">
                    <JsonEditorComponent
                        schema={schema}
                        data={data}
                        onChange={onChange}/>
                </div>
            </ScrollPane>,
            ...(schema?.type === 'object' && schema?.properties?.entries?.type === 'array' ?
                {
                    "List (beta)": () => <JsonEditorListComponent
                        schema={schema}
                        data={data}
                        onChange={onChange}/>
                } :
                {}),
            "Text (beta)": () => <ScrollPane>
                <div className="p-2"><JsonEditorTextComponent
                    schema={schema}
                    data={data}
                    onChange={onChange}/>
                </div>
            </ScrollPane>
        }

        const activeTabOrDefault = activeTab ?? Object.keys(tabs)[0]

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
                {tabs[activeTabOrDefault]()}
            </div>
        </div>
    }
}

export default JsonEditorTabsComponent
