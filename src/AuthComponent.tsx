import React from 'react'
import {UserManager} from "oidc-client-ts"
import {Git, GitPlatform, ssoPlatform} from "./GitPlatform"
import AuthDialog from "./html/AuthDialog";

class AuthComponent extends React.Component<{
    url: string,
    client_ids: Record<string, string>,
    redirect_origin: string,
    onAuth: (gitPlatform: GitPlatform, credentials: { username: string, password: string }, author: { name: string, email: string }) => void,
    children: React.ReactNode
}, {
    gitPlatform: GitPlatform | null,
    userManager: UserManager | null,
    authenticated: boolean
}> {
    platformAndUserManager(): { gitPlatform: GitPlatform, userManager: UserManager } | null {
        const {url, client_ids, redirect_origin} = this.props

        const {gitPlatform, authority, client_id} = ssoPlatform(url, client_ids) || {}
        if (gitPlatform == null || authority == null || client_id == null) return null
        const redirect_uri = window.location.href.replace(/^https?:\/\/[^\/?]*\/?/, redirect_origin)
        const userManager = gitPlatform.userManager(authority, client_id, redirect_uri)
        if (userManager == null) return null
        return {gitPlatform, userManager}
    }

    componentDidMount() {
        const {onAuth} = this.props

        const {gitPlatform, userManager} = this.platformAndUserManager() || {}
        if (gitPlatform != null && userManager != null) {
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
                            window.history.replaceState(null, document.title, newUrl.href)
                            return user
                        })
                    } else {
                        userManager?.signinRedirect()
                        return null;
                    }
                }
            }).then(user => {
                if (user != null) {
                    onAuth(
                        gitPlatform,
                        gitPlatform.oauthCredentials(user?.access_token || ''),
                        {
                            name: user.profile.name || '',
                            email: user.profile.email || ''
                        })
                    this.setState(state => ({...state, authenticated: true}))
                }
            })
        }
    }

    render() {
        const {url, onAuth, children} = this.props
        const {authenticated} = this.state || {}

        if (authenticated) {
            return children
        } else {
            return <AuthDialog
                url={url}
                onAuth={(credentials, author) => {
                    onAuth(Git, credentials, author)
                }}/>
        }
    }
}

export default AuthComponent
