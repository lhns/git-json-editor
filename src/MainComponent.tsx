import React from 'react'
import * as git from "isomorphic-git"
import {GitOpts} from "./GitBranchSelectComponent"
import AuthComponent from "./AuthComponent"
import GitJsonEditorComponent from "./GitJsonEditorComponent"
import {GitPlatform} from "./GitPlatform";

class MainComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    client_ids: Record<string, string>,
    redirect_origin: string
}, {
    gitPlatform: GitPlatform,
    credentials: { username: string, password: string },
    author: { name: string, email: string }
}> {
    render() {
        const {fs, gitOpts, client_ids, redirect_origin} = this.props
        const {gitPlatform, author, credentials} = this.state || {}

        return <AuthComponent
            url={gitOpts.url}
            client_ids={client_ids}
            redirect_origin={redirect_origin}
            onAuth={(gitPlatform, credentials, author) => {
                this.setState(state => ({...state, gitPlatform, credentials, author}))
            }}>
            <GitJsonEditorComponent
                fs={fs}
                gitOpts={{...gitOpts, author, onAuth: () => credentials}}
                gitPlatform={gitPlatform}/>
        </AuthComponent>
    }
}

export default MainComponent
