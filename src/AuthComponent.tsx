import React from 'react'
import {UserManager} from "oidc-client-ts"
import {Git, GitLab, GitPlatform} from "./GitPlatform"
import AuthDialog from "./html/AuthDialog";

class AuthComponent extends React.Component<{
    url: string,
    client_id: string,
    redirect_origin: string,
    onAuth: (gitPlatform: GitPlatform, credentials: { username: string, password: string }, author: { name: string, email: string }) => void,
    children: React.ReactNode
}, {
    userManager: UserManager,
    authenticated: boolean
}> {
    render() {
        const {url, client_id, redirect_origin, onAuth, children} = this.props
        const {authenticated} = this.state || {}

        const gitPlatform = GitLab

        const userManager = new UserManager({
            authority: new URL(url).origin,
            client_id,
            redirect_uri: window.location.href.replace(/^https?:\/\/[^\/?]*\/?/, redirect_origin),
            scope: gitPlatform.oauthScopes.join(' '),
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
                    //console.log(user)
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


        return authenticated ?
            children :
            <AuthDialog
                url={url}
                onAuth={(credentials, author) => {
                    onAuth(Git, credentials, author)
                }}
                onSsoAuth={gitPlatform => {
                    userManager.signinRedirect()
                }}/>
    }
}

export default AuthComponent
