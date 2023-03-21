import React from "react"
import Editor from 'react-simple-code-editor'
import {highlight, languages} from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism.css'

class JsonEditorTextComponent extends React.Component<{
    data: string,
    onChange: (data: any) => void
}, {
    value: string
}> {
    constructor(props: any) {
        super(props)
        this.state = {value: props.data}
    }

    componentDidUpdate(prevProps: any) {
        const {data} = this.props

        if (data !== prevProps.data) {
            this.setState(state => ({...state, value: data}))
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
                    JSON.parse(code)
                    onChange(code)
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
