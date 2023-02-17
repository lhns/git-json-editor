import React from 'react'
import {UserManager} from "oidc-client-ts";

class AuthComponent extends React.Component<{
    url: string,
    client_id: string,
    redirect_origin: string,
    onAuth: (credentials: { username: string, password: string }, author: { name: string, email: string }) => void,
    children: React.ReactNode
}, {
    userManager: UserManager,
    username: string,
    password: string,
    name: string,
    email: string
    authenticated: boolean
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
        const {url, client_id, redirect_origin, onAuth, children} = this.props
        const {username, password, name, email, authenticated} = this.state || {}

        // gitlab
        const userManager = new UserManager({
            authority: new URL(url).origin,
            client_id: client_id,
            redirect_uri: window.location.href.replace(/^https?:\/\/[^\/?]*\/?/, redirect_origin),
            scope: 'read_repository write_repository openid email',
            loadUserInfo: true
        })
        userManager.events.addAccessTokenExpiring(function () {
            console.log("token expiring...");
        })
        if (!authenticated) {
            userManager.getUser().then(user => {
                if (user != null) {
                    return user
                } else {
                    const url = window.location.href
                    const isRedirectCallback = new URL(url).searchParams.get('code') != null
                    if (isRedirectCallback) {
                        return userManager.signinRedirectCallback().then(user => {
                            const newUrl = new URL(url)
                            newUrl.searchParams.delete('code')
                            newUrl.searchParams.delete('state')
                            window.location.replace(newUrl.href)
                            return user
                        })
                    } else {
                        return null
                    }
                }
            }).then(user => {
                if (user != null) {
                    console.log(user)
                    onAuth({
                        username: 'oauth2', //token
                        password: user?.access_token || ''
                    }, {
                        name: user.profile.name || '',
                        email: user.profile.email || ''
                    })
                    this.setState(state => ({...state, authenticated: true}))
                }
            })
        }

        const authFromInputs = () => {
            onAuth({
                username,
                password
            }, {
                name,
                email
            })
            this.setState(state => ({...state, authenticated: true}))
        }

        return authenticated ?
            children :
            <div className="container">
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
                        value={username || ''}
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
                    <button type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                                userManager.signinRedirect()
                            }}>
                        GitLab
                    </button>
                </div>
            </div>
    }
}

export default AuthComponent
