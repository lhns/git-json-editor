import React from 'react'
// @ts-ignore
import {JSONEditor} from '@json-editor/json-editor/dist/jsoneditor'

class InternalJsonEditorComponent extends React.Component<{
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

    private getValue(editor: any, data?: any): string {
        let value = editor.getValue()
        if (typeof value === 'object' && data?.$schema != null) {
            value = {
                $schema: data.$schema,
                ...value
            }
        }
        return value
    }

    componentDidMount() {
        const {schema, data: initialData} = this.props
        const elem = document.createElement('div')
        this.root.current?.appendChild(elem)
        const editor = new JSONEditor(elem, {
            theme: 'bootstrap5',
            iconlib: 'openiconic',
            show_errors: 'always',
            schema: schema,
            startval: initialData
        })
        editor.ignoreInitialChange = true
        editor.on('change', () => {
            if (editor.ignoreInitialChange) {
                editor.ignoreInitialChange = false
            } else {
                const data = this.getValue(editor, initialData)
                this.props.onChange(data)
            }
        })
        editor.promise.then(() => {
            const schema = editor.getEditor('root.$schema')
            if (schema != null) {
                schema.container.style.display = 'none'
            }
        })
        this.editor = editor
    }

    componentWillUnmount() {
        const editor = this.editor
        editor.promise.then(() => editor.destroy())
    }

    componentDidUpdate(prevProps: any) {
        const {data} = this.props
        const editor = this.editor
        const dataJson = JSON.stringify(data)
        if (dataJson !== JSON.stringify(prevProps.data) &&
            dataJson !== JSON.stringify(this.getValue(editor, prevProps.data))) {
            editor.promise.then(() => {
                editor.ignoreInitialChange = true
                editor.setValue(data)
            })
        }
    }

    render() {
        return <div ref={this.root}/>
    }
}

class JsonEditorComponent extends React.Component<{
    schema: any,
    data?: any,
    onChange: (data: any) => void
}> {
    render() {
        const {schema, data, onChange} = this.props
        return <InternalJsonEditorComponent
            key={JSON.stringify([schema, data?.$schema])}
            schema={schema}
            data={data}
            onChange={onChange}/>
    }
}

export default JsonEditorComponent
