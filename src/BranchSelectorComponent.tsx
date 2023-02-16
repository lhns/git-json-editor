import React from 'react'
import * as git from 'isomorphic-git'
import {v4 as uuidv4} from "uuid"
import FileListComponent from './FileListComponent'
import {readDirRec} from './Utils'

class BranchSelectorComponent extends React.Component<{
    branches: string[],
    onSelect: (branch: string) => void
}, {
    selected: string
}> {
    render() {
        const {branches, onSelect} = this.props
        const {selected} = this.state || {}
        return <div>
            <select className="form-select form-select-lg"
                    value={selected}
                    onChange={event => {
                        const branch = branches[event.target.selectedIndex]
                        this.setState(state => ({...state, selected: branch}))
                        onSelect(branch)
                    }}>
                {branches.map(branch =>
                    <option key={branch} value={branch}>{branch}</option>
                )}
            </select>
        </div>
    }
}

export default BranchSelectorComponent
