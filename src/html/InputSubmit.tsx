import React from 'react'

class Select extends React.Component<{
    label?: string,
    value: string,
    action: string,
    placeholder?: string,
    disabled?: boolean
    onSubmit: (value: string) => void
}, {
    value: string
}> {
    constructor(props: any) {
        super(props)

        this.state = {
            value: props.value
        }
    }

    componentDidUpdate(prevProps: any) {
        const {value} = this.props
        if (value != null && value !== prevProps.value) {
            this.setState(state => ({...state, value: value}))
        }
    }

    render() {
        const {label, action, placeholder, disabled, onSubmit} = this.props
        const {value} = this.state ?? {}

        return <div className="input-group">
            {label ? <span className="input-group-text">{label}</span> : null}
            <input type="text"
                   className="form-control"
                   placeholder={placeholder}
                   disabled={disabled}
                   value={value ?? ''}
                   onChange={event => {
                       const value = event.target.value
                       this.setState(state => ({...state, value: value}))
                   }}
                   onKeyDown={event => {
                       if (event.key === 'Enter') {
                           onSubmit(value)
                       }
                   }}/>
            <button type="button"
                    className="btn btn-primary"
                    disabled={disabled}
                    onClick={() => onSubmit(value)}>{action}
            </button>
        </div>
    }
}

export default Select
