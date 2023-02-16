import React from 'react'

class InputDialog extends React.Component<{
    action: string,
    placeholder?: string
    disabled?: boolean,
    onConfirm: (message: string) => void
}, {
    message: string
}> {
    render() {
        const {action, placeholder, disabled, onConfirm} = this.props
        const {message} = this.state || {}
        return <div className="d-flex flex-column gap-1">
            <input type="text"
                   className="form-control"
                   placeholder={placeholder}
                   disabled={disabled}
                   value={message || ''}
                   onChange={event => {
                       const message = event.target.value
                       this.setState(state => ({...state, message: message}))
                   }}
                   onKeyDown={event => {
                       if (event.key === 'Enter') {
                           onConfirm(message)
                       }
                   }}/>
            <button type="button"
                    className="btn btn-primary"
                    disabled={disabled}
                    onClick={() => onConfirm(message)}>{action}</button>
        </div>
    }
}

export default InputDialog
