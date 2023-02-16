import React from 'react'
import ScrollPane from "./ScrollPane";

class FileListComponent extends React.Component<{
    files: string[],
    render: (file: string) => string
    onSelect: (file: string) => void
}, {
    selected: string
}> {
    render() {
        const {files, render, onSelect} = this.props
        const {selected} = this.state || {}
        return <ScrollPane>
            <table className="table table-sm table-hover">
                <tbody>
                {files.map(file => {
                    const isSelected = selected === file
                    return <tr key={file}>
                        <td className={(isSelected ? 'table-active' : '')}
                            onClick={() => {
                                this.setState(state => ({...state, selected: file}))
                                onSelect(file)
                            }}>{render(file)}</td>
                    </tr>
                })}
                </tbody>
            </table>
        </ScrollPane>
    }
}

export default FileListComponent
