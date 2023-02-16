import React from 'react'

class Select extends React.Component<{
    items: string[],
    selected?: string,
    disabled?: Boolean,
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
        const {items, disabled, onSelect} = this.props
        const {selected} = this.state || {}
        return <div>
            <select className="form-select form-select-lg"
                    value={selected}
                    disabled={disabled === true}
                    onChange={event => {
                        const item = items[event.target.selectedIndex]
                        this.setState(state => ({...state, selected: item}))
                        onSelect(item)
                    }}>
                {items.map(item =>
                    <option key={item} value={item}>{item}</option>
                )}
            </select>
        </div>
    }
}

export default Select
