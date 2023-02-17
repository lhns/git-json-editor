import React from 'react'

class SelectList extends React.Component<{
    items: string[],
    render: (item: string) => React.ReactNode
    selected?: string,
    onSelect: (item: string) => void
}, {
    selected: string
}> {
    constructor(props: any) {
        super(props)

        this.state = {
            selected: props.selected
        }
    }

    componentDidUpdate(prevProps: any) {
        const {selected} = this.props
        if (selected != null && selected !== prevProps.selected) {
            this.setState(state => ({...state, selected: selected}))
        }
    }

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
