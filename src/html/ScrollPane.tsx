import React from 'react'

class ScrollPane extends React.Component<{ children: React.ReactNode }> {
    render() {
        const {children} = this.props
        return <div className="h-100 d-flex">
            <div className="flex-fill h-100 d-flex flex-column">
                <div className="flex-fill h-0 d-flex flex-row">
                    <div className="flex-fill w-0 d-flex">
                        <div className="flex-fill overflow-auto">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default ScrollPane
