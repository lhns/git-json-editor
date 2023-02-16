import React from 'react'

class CommitDialog extends React.Component<{
    disabled?: boolean,
    onCommit: (message: string) => void
}, {
    message: string
}> {
    render() {
        const {disabled, onCommit} = this.props
        const {message} = this.state || {}
        return <div className="d-flex flex-column gap-1">
            <input type="text"
                   className="form-control"
                   placeholder="Commit Message"
                   disabled={disabled}
                   value={message || ''}
                   onChange={event => {
                       const message = event.target.value
                       this.setState(state => ({...state, message: message}))
                   }}
                   onKeyDown={event => {
                       if (event.key === 'Enter') {
                           onCommit(message)
                       }
                   }}/>
            <button type="button"
                    className="btn btn-primary"
                    disabled={disabled}
                    onClick={() => onCommit(message)}>
                Commit
            </button>
        </div>
    }
}

export default CommitDialog
