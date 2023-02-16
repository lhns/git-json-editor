import React from 'react'

class CenteredSpinner extends React.Component {
    render() {
        return <div className="d-flex justify-content-center p-2">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    }
}

export default CenteredSpinner
