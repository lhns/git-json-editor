import React from 'react'

class CommitDialog extends React.Component<{
    action: string,
    placeholderMessage?: string
    placeholderBranch?: string
    disabled?: boolean,
    onConfirm: (message: string, branch: string) => void
}, {
    message?: string,
    branch?: string
}> {
    render() {
        const {action, placeholderMessage, placeholderBranch, disabled, onConfirm} = this.props
        const {message, branch} = this.state ?? {}

        const confirm = () => {
            this.setState(state => ({
                ...state,
                message: undefined,
                branch: undefined
            }))
            onConfirm(message ?? '', branch ?? '')
        }

        const branchNameFromMessage = (message: string) =>
            message != '' ?
                'feature/' + message.toLowerCase()
                    .replaceAll(/[-_.,:;\s]+/g, '-')
                    .replaceAll(/^-|-$/g, '') :
                ''

        return <div className="d-flex flex-column gap-1">
            <input type="text"
                   className="form-control"
                   placeholder={placeholderMessage}
                   disabled={disabled}
                   value={message ?? ''}
                   onChange={event => {
                       const value = event.target.value
                       this.setState(state => ({
                           ...state,
                           message: value,
                           branch: branchNameFromMessage(value)
                       }))
                   }}
                   onKeyDown={event => {
                       if (event.key === 'Enter') {
                           confirm()
                       }
                   }}/>
            <input type="text"
                   className="form-control"
                   placeholder={placeholderBranch}
                   disabled={disabled}
                   value={branch ?? ''}
                   onChange={event => {
                       const value = event.target.value
                       this.setState(state => ({...state, branch: value}))
                   }}
                   onKeyDown={event => {
                       if (event.key === 'Enter') {
                           confirm()
                       }
                   }}/>
            <button type="button"
                    className="btn btn-primary"
                    disabled={disabled || !message || !branch}
                    onClick={() => confirm()}>{action}</button>
        </div>
    }
}

export default CommitDialog
