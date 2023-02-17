import React from 'react'
// @ts-ignore
import {JSONEditor} from '@json-editor/json-editor/dist/jsoneditor'

class JsonEditorComponent extends React.Component<{
    schema: any,
    data?: any,
    onChange: (data: any) => void
}, {
    editor: any
}> {
    private root: React.RefObject<HTMLDivElement>

    constructor(props: any) {
        super(props)
        this.root = React.createRef()
    }

    private getValue(editor: any): string {
        let value = editor?.getValue()
        if (typeof value === 'object' && this.props.data != null) {
            value = {
                $schema: this.props.data['$schema'],
                ...value
            }
        }
        return value
    }

    private createEditor() {
        const elem = document.createElement('div')
        this.root.current?.appendChild(elem)
        const editor = new JSONEditor(elem, {
            theme: 'bootstrap5',
            iconlib: 'openiconic',
            schema: this.props.schema,
            startval: this.props.data
            //show_errors: 'change'
        })
        editor.on('change', () => {
            //console.log("validate")
            //console.log(this.editor.validate())
            const value = this.getValue(editor)
            this.props.onChange(value)
        })
        this.setState(state => ({...state, editor}))
    }

    private destroyEditor() {
        const {editor} = this.state || {}
        editor?.promise.then(() => {
            editor.destroy()
        })
        this.setState(state => ({...state, editor: undefined}))
    }

    componentDidMount() {
        this.createEditor()
    }

    componentDidUpdate(prevProps: any) {
        const {editor} = this.state || {}
        if (JSON.stringify(this.props.schema) !== JSON.stringify(prevProps.schema)) {
            this.destroyEditor()
            this.createEditor()
        } else if (JSON.stringify(this.props.data) !== JSON.stringify(prevProps.data) &&
            JSON.stringify(this.props.data) !== JSON.stringify(this.getValue(editor))) {
            editor.setValue(this.props.data)
        }
    }

    componentWillUnmount() {
        this.destroyEditor()
    }

    render() {
        return <div ref={this.root}/>
    }
}

export default JsonEditorComponent
