import React from 'react'
import * as git from "isomorphic-git";
import {GitOpts} from "./GitBranchSelectComponent";
import AuthComponent from "./AuthComponent";
import GitJsonEditorComponent from "./GitJsonEditorComponent";

class MainComponent extends React.Component<{
    fs: git.PromiseFsClient,
    gitOpts: GitOpts,
    client_id: string,
    redirect_origin: string
}, {
    credentials: { username: string, password: string },
    author: { name: string, email: string }
}> {
    render() {
        const {fs, gitOpts, client_id, redirect_origin} = this.props
        const {author, credentials} = this.state || {}

        return <AuthComponent
            url={gitOpts.url}
            client_id={client_id}
            redirect_origin={redirect_origin}
            onAuth={(credentials, author) => {
                this.setState(state => ({...state, credentials, author}))
            }}>
            <GitJsonEditorComponent fs={fs} gitOpts={{...gitOpts, author, onAuth: () => credentials}}/>
        </AuthComponent>
    }
}

export default MainComponent
