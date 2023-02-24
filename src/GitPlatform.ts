import {UserManager} from "oidc-client-ts";

interface GitPlatform {
    id: string

    userManager(authority: string,
                client_id: string,
                redirect_uri: string): UserManager | null

    oauthCredentials(token: string): { username: string, password: string }

    getMergeRequestUrl(url: string, sourceBranch: string, targetBranch: string): string | null
}

const Git: GitPlatform = {
    id: 'git',
    userManager(authority: string, client_id: string, redirect_uri: string): UserManager | null {
        return null
    },
    oauthCredentials(token: string): { username: string; password: string } {
        return {username: '', password: ''}
    },
    getMergeRequestUrl(url: string, sourceBranch: string, targetBranch: string): string | null {
        return null;
    }
}

const newUserManager = (authority: string,
                        client_id: string,
                        redirect_uri: string,
                        scopes: string[]) => {
    const userManager = new UserManager({
        authority,
        client_id,
        redirect_uri,
        scope: scopes.length != 0 ? scopes.join(' ') : undefined,
        loadUserInfo: true
    })
    userManager.events.addAccessTokenExpiring(function () {
        console.log("token expiring...");
    })
    return userManager
}

const GitLab: GitPlatform = {
    id: 'gitlab',
    userManager(authority: string, client_id: string, redirect_uri: string): UserManager | null {
        return newUserManager(
            authority, client_id, redirect_uri,
            ['openid', 'read_repository', 'write_repository', 'email']
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
    userManager(authority: string, client_id: string, redirect_uri: string): UserManager | null {
        return newUserManager(
            authority, client_id, redirect_uri,
            ['openid', 'repo', 'user:email']
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

const ssoPlatform = (url: string, client_ids: Record<string, string>): {
    gitPlatform: GitPlatform,
    authority: string,
    client_id: string
} | null => {
    const authority = new URL(url).origin
    const client_id_entry = client_ids[authority]
    if (client_id_entry == null) return null;
    const parts = client_id_entry.split(":")
    const id = parts.shift()
    const client_id = parts.join(':')
    const gitPlatform = gitPlatforms.find(gitPlatform => gitPlatform.id === id)
    if (gitPlatform == null) return null;
    return {gitPlatform, authority, client_id}
}

export {Git, GitLab, GitHub, ssoPlatform}
export type {GitPlatform}
