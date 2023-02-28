import React from "react"
import Editor from 'react-simple-code-editor'
import {highlight, languages} from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism.css'

class JsonEditorTextComponent extends React.Component<{
    schema: any,
    data?: any,
    onChange: (data: any) => void
}, {
    value: string
}> {
    constructor(props: any) {
        super(props)
        this.state = {value: JSON.stringify(props.data, null, 2)}
    }

    componentDidUpdate(prevProps: any) {
        const {data} = this.props

        if (JSON.stringify(data) !== JSON.stringify(prevProps.data)) {
            this.setState(state => ({...state, value: JSON.stringify(data, null, 2)}))
        }
    }

    render() {
        const {data, onChange} = this.props
        const {value} = this.state ?? {}

        return data != null ? <Editor
            className="simple-code-editor"
            value={value}
            onValueChange={code => {
                this.setState(state => ({...state, value: code}))
                try {
                    onChange(JSON.parse(code))
                } catch (e) {
                }
            }}
            highlight={code => code != null ? highlight(code, languages.json, 'json') : null}
            style={{
                fontFamily: 'monospace',
                fontSize: 12,
            }}/> : null
    }
}

export default JsonEditorTextComponent
