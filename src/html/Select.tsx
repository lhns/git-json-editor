import React from 'react'

class Select extends React.Component<{
    label?: string,
    items: string[],
    selected?: string,
    disabled?: Boolean
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
        const {items, disabled, label, onSelect} = this.props
        const {selected} = this.state ?? {}

        return <div className="input-group">
            {label ? <span className="input-group-text">{label}</span> : null}
            <select className="form-select"
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
