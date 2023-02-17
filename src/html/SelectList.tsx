import React from 'react'

class SelectList extends React.Component<{
    items: string[],
    render: (item: string) => React.ReactNode
    onSelect: (item: string) => void
}, {
    selected: string
}> {
    render() {
        const {items, render, onSelect} = this.props
        const {selected} = this.state || {}
        return <table className="table table-sm table-hover">
            <tbody>
            {items.map(item => {
                const isSelected = selected === item
                return <tr key={item}>
                    <td className={'mx-2' + (isSelected ? ' table-active' : '')}
                        style={{
                            cursor: 'pointer',
                            borderRadius: '4px'
                        }}
                        onClick={() => {
                            this.setState(state => ({...state, selected: item}))
                            onSelect(item)
                        }}>{render(item)}</td>
                </tr>
            })}
            </tbody>
        </table>
    }
}

export default SelectList
