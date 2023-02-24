import React from 'react'

class AuthDialog extends React.Component<{
    url: string,
    onAuth: (credentials: { username: string, password: string }, author: { name: string, email: string }) => void
}, {
    username: string,
    password: string,
    name: string,
    email: string
}> {
    private readonly passwordInputRef: React.RefObject<HTMLInputElement>
    private readonly nameInputRef: React.RefObject<HTMLInputElement>
    private readonly emailInputRef: React.RefObject<HTMLInputElement>

    constructor(props: any) {
        super(props)
        this.passwordInputRef = React.createRef()
        this.nameInputRef = React.createRef()
        this.emailInputRef = React.createRef()
    }

    render() {
        const {url, onAuth} = this.props
        const {username, password, name, email} = this.state || {}

        const authFromInputs = () => {
            onAuth({
                username,
                password
            }, {
                name,
                email
            })
        }

        return <div className="container">
            <div className="d-flex flex-column gap-2">
                <h1>{url}</h1>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={username || ''}
                    onChange={event => {
                        const value = event.target.value
                        this.setState(state => ({...state, username: value}))
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            const input = this.passwordInputRef.current
                            input?.focus()
                        }
                    }}/>
                <input
                    ref={this.passwordInputRef}
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password || ''}
                    onChange={event => {
                        const value = event.target.value
                        this.setState(state => ({...state, password: value}))
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            const input = this.nameInputRef.current
                            input?.focus()
                        }
                    }}/>
                <input
                    ref={this.nameInputRef}
                    type="text"
                    className="form-control mt-2"
                    placeholder="Name"
                    value={name || ''}
                    onChange={event => {
                        const value = event.target.value
                        this.setState(state => ({...state, name: value}))
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            const input = this.emailInputRef.current
                            input?.focus()
                        }
                    }}/>
                <input
                    ref={this.emailInputRef}
                    type="text"
                    className="form-control"
                    placeholder="Email"
                    value={email || ''}
                    onChange={event => {
                        const value = event.target.value
                        this.setState(state => ({...state, email: value}))
                    }}
                    onKeyDown={event => {
                        if (event.key === 'Enter') {
                            authFromInputs()
                        }
                    }}/>
                <button type="button"
                        className="btn btn-primary mt-2"
                        disabled={!username || !password || !name || !email}
                        onClick={() => {
                            authFromInputs()
                        }}>
                    Login
                </button>
            </div>
        </div>
    }
}

export default AuthDialog
