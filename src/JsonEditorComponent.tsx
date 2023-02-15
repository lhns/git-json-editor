import React from 'react'
// @ts-ignore
import {JSONEditor} from '@json-editor/json-editor/dist/jsoneditor'

class JsonEditorComponent extends React.Component<{ schema: any, data?: any }> {
    private root: React.RefObject<HTMLDivElement>
    private editor: any

    constructor(props: any) {
        super(props)
        this.root = React.createRef()
    }

    private createEditor() {
        const elem = document.createElement('div')
        this.root.current?.appendChild(elem)
        this.editor = new JSONEditor(elem, {
            theme: 'bootstrap5',
            iconlib: 'openiconic',
            schema: this.props.schema,
            startval: this.props.data,
            show_errors: 'change'
        })
        console.log(this.editor)
        this.editor.on('change', () => {
            console.log("validate")
            console.log(this.editor.validate())
        })
    }

    private destroyEditor() {
        const editor = this.editor
        this.editor.promise.then(() => {
            editor.destroy()
        })
    }

    componentDidMount() {
        this.createEditor()
    }

    componentDidUpdate(prevProps: any) {
        if (this.props.schema !== prevProps.schema) {
            this.destroyEditor()
            this.createEditor()
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
