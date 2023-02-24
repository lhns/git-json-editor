interface GitPlatform {
    id: string

    oauthScopes: string[]

    oauthCredentials(token: string): { username: string, password: string }

    getMergeRequestUrl(url: string, sourceBranch: string, targetBranch: string): string | null
}

const Git: GitPlatform = {
    id: 'git',
    oauthScopes: [],
    oauthCredentials(token: string): { username: string; password: string } {
        return {username: '', password: ''}
    },
    getMergeRequestUrl(url: string, sourceBranch: string, targetBranch: string): string | null {
        return null;
    }
}

const GitLab: GitPlatform = {
    id: 'gitlab',
    oauthScopes: ['read_repository', 'write_repository', 'openid', 'email'],
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
    oauthScopes: [],
    oauthCredentials(token: string): { username: string; password: string } {
        return {username: token, password: 'x-oauth-basic'}
    },
    getMergeRequestUrl(url: string, sourceBranch: string, targetBranch: string): string | null {
        return null;
    }
}

export {Git, GitLab, GitHub}
export type {GitPlatform}
