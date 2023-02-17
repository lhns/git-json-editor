import React from 'react'

class Alert extends React.Component<{ children: React.ReactNode }> {
    render() {
        const {children} = this.props
        return <div className="alert alert-danger" role="alert">
            {children}
        </div>
    }
}

export default Alert
