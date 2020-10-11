import React from 'react'
import { withRouter } from "react-router-dom"
import { signin, signout, user } from "../firebase"
import AccountCircleSVG from "../account_circle-black-18dp.svg"

class Header extends React.Component {
    constructor(props) {
        super(props)
        this.state = { showUserContainer: false, userName: '' }
        this.toggleUserContainer = this.toggleUserContainer.bind(this)
        this.onClickSigninButton = this.onClickSigninButton.bind(this)
        this.onClickSignoutButton = this.onClickSignoutButton.bind(this)
        if (user.uid !== null) this.state.userName = user.data.name
        document.addEventListener("userLoaded", () => {
            this.setState({ userName: user.data.name })
        })
    }

    render() {
        return (
            <div className="header-container">
                <div className="header-text">{this.props.title}</div>
                <div className="user-preview" onClick={this.toggleUserContainer}>
                    <div className="user-name">{this.state.userName}</div>
                    <img className="user-img" src={AccountCircleSVG} alt="icon" />
                </div>
                {this.state.showUserContainer && (<div className="user-container">
                    {!user.authenticated && (
                        <div>
                            <button onClick={this.onClickSigninButton}>入魂</button>
                            <p className="small">アカウント新規作成 or ログイン </p>
                        </div>
                    )}
                    {user.authenticated && (
                        <div>
                            <button onClick={this.onClickSignoutButton}>離脱</button>
                            <p className="small">ログアウト</p>
                        </div>
                    )}
                </div>)}
            </div>
        )
    }

    toggleUserContainer() {
        this.setState({ showUserContainer: !this.state.showUserContainer })
    }

    onClickSigninButton() {
        signin().then((function () {
            if (user.authenticated && !user.initialized) {
                this.props.history.push("/init")
            }
            this.render()
        }).bind(this))
    }

    onClickSignoutButton() {
        signout().then(() => {
            this.render()
        })
    }
}

export default withRouter(Header)