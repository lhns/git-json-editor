import {UserManager} from "oidc-client-ts";

interface GitPlatform {
    id: string

    userManager(url: string,
                client_ids: Record<string, string>,
                redirect_uri: string): UserManager | null

    oauthCredentials(token: string): { username: string, password: string }

    getMergeRequestUrl(url: string, sourceBranch: string, targetBranch: string): string | null
}

const Git: GitPlatform = {
    id: 'git',
    userManager(url: string, client_ids: Record<string, string>, redirect_uri: string): UserManager | null {
        return null
    },
    oauthCredentials(token: string): { username: string; password: string } {
        return {username: '', password: ''}
    },
    getMergeRequestUrl(url: string, sourceBranch: string, targetBranch: string): string | null {
        return null;
    }
}

const newUserManager = (url: string,
                        client_ids: Record<string, string>,
                        redirect_uri: string,
                        scopes: string[]) => {
    const origin = new URL(url).origin
    const client_id = client_ids[origin]
    if (client_id != null) {
        const userManager = new UserManager({
            authority: origin,
            client_id,
            redirect_uri,
            scope: scopes.length != 0 ? scopes.join(' ') : undefined,
            loadUserInfo: true
        })
        userManager.events.addAccessTokenExpiring(function () {
            console.log("token expiring...");
        })
        return userManager
    } else {
        return null
    }
}

const GitLab: GitPlatform = {
    id: 'gitlab',
    userManager(url: string, client_ids: Record<string, string>, redirect_uri: string): UserManager | null {
        return newUserManager(
            url, client_ids, redirect_uri,
            ['read_repository', 'write_repository', 'openid', 'email']
        )
    },
    oauthCredentials(token: string): { username: string; password: string } {
        return {username: 'oauth2', password: token}
    },
    getMergeRequestUrl(url: string, sourceBranch: string, targetBranch: string): string | null {
        const newUrl = new URL(url.replace(/(.git)?$/, '/-/merge_requests/new'))
        newUrl.searchParams.set('merge_request[source_branch]', sourceBranch)
        newUrl.searchParams.set('merge_request[target_branch]', targetBranch)
        return newUrl.href
    }
}

const GitHub: GitPlatform = {
    id: 'github',
    userManager(url: string, client_ids: Record<string, string>, redirect_uri: string): UserManager | null {
        return newUserManager(
            url, client_ids, redirect_uri,
            []
        )
    },
    oauthCredentials(token: string): { username: string; password: string } {
        return {username: token, password: 'x-oauth-basic'}
    },
    getMergeRequestUrl(url: string, sourceBranch: string, targetBranch: string): string | null {
        return null;
    }
}

const gitPlatforms: GitPlatform[] = [
    Git,
    GitLab,
    GitHub
]

const storageKey = (url: string) => 'git-platform:' + new URL(url).origin

const storeGitPlatform = (url: string, gitPlatform: GitPlatform) => {
    window.sessionStorage.setItem(storageKey(url), gitPlatform.id)
}
const loadGitPlatform = (url: string): GitPlatform | null => {
    const id = window.sessionStorage.getItem(storageKey(url))
    if (id == null) return null
    const gitPlatform = gitPlatforms.find(gitPlatform => gitPlatform.id === id)
    return gitPlatform || null
}

export {Git, GitLab, GitHub, storeGitPlatform, loadGitPlatform}
export type {GitPlatform}
