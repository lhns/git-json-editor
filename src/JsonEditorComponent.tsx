import React from 'react'
// @ts-ignore
import {JSONEditor} from '@json-editor/json-editor/dist/jsoneditor'

class JsonEditorComponent extends React.Component<{
    schema: any,
    data?: any,
    onChange: (data: any) => void
}> {
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
            startval: this.props.data
            //show_errors: 'change'
        })
        this.editor.on('change', () => {
            //console.log("validate")
            //console.log(this.editor.validate())
            let value = this.editor.getValue()
            if (typeof value === 'object') {
                value = {
                    $schema: this.props.data['$schema'],
                    ...value
                }
            }
            this.props.onChange(value)
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
        if (JSON.stringify(this.props.schema) !== JSON.stringify(prevProps.schema)) {
            this.destroyEditor()
            this.createEditor()
        } else if (JSON.stringify(this.props.data) !== JSON.stringify(prevProps.data)) {
            this.editor.setValue(this.props.data)
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
