import React from 'react';
import { Link, withRouter } from "react-router-dom"
import '../App.css';
import Header from '../components/Header'
import { firebase, user, signin, db } from '../firebase';

class InitUserPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            userName: "",
            gender: "none",
            yearOfBirth: "",
            step: 1
        }
        this.onChangeUserName = this.onChangeUserName.bind(this)
        this.onChangeGender = this.onChangeGender.bind(this)
        this.onChangeBirthYear = this.onChangeBirthYear.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        document.addEventListener("userLoaded", () => {
            this.render()
            if (user.authenticated === false) {
                signin()
            }
        })
    }

    render() {
        return (
            <div className="App">
                <Header title="初期設定" />
                <div className="main-container">
                    {this.state.step === 1 && (
                        <div>
                            <p>なまえを入力(オープンチャットでは非公開)</p>
                            <form onSubmit={this.onSubmit}>
                                <input value={this.state.userName} onChange={this.onChangeUserName} />
                                <button type='submit'>決定</button>
                            </form>

                        </div>
                    )}
                    {this.state.step === 2 && (
                        <div>
                            <p>性別を選択(非公開)</p>
                            <form onSubmit={this.onSubmit}>
                                <div className="radio-input">
                                    <input name="gender" type="radio" value="male" onChange={this.onChangeGender}></input>
                                    <div>男性</div>
                                </div>
                                <div className="radio-input">
                                    <input name="gender" type="radio" value="female" onChange={this.onChangeGender}></input>
                                    <div>女性</div>
                                </div>
                                <div className="radio-input">
                                    <input name="gender" type="radio" value="neither" onChange={this.onChangeGender}></input>
                                    <div>どちらでもない</div>
                                </div>
                                <div className="radio-input">
                                    <input name="gender" type="radio" value="none" onChange={this.onChangeGender} checked></input>
                                    <div>答えない</div>
                                </div>
                                <button type="submit">決定</button>
                            </form>
                        </div>
                    )}
                    {this.state.step === 3 && (
                        <div>
                            <p>生まれ年(非公開)</p>
                            <form onSubmit={this.onSubmit}>
                                <select onChange={this.onChangeBirthYear}>
                                    {(() => {
                                        const year = (new Date()).getFullYear()
                                        let result = []
                                        for (let i = 0; i < 120; i++) {
                                            let tmp = year - i
                                            result.push(<option key={`option_year_${tmp}`} value={tmp}>{tmp}年</option>)
                                        }
                                        return result
                                    })()}
                                </select>
                                <button type="submit">決定</button>
                            </form>
                        </div>
                    )}
                    {this.state.step === 4 && (
                        <div>
                            <p>設定完了！</p>
                            <p><Link to="/">Home</Link>に戻る</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    onChangeUserName(e) {
        this.setState({
            userName: e.target.value,
            userNameValidation: this.validataionUserName(e.target.value)
        })
    }

    validataionUserName(userName) {
        const regex = /^[a-zA-Z0-9ぁ-んァ-ヶ亜-熙_\(\)]+$/
        if (userName.length < 15
            && userName.length > 1
            && userName.match(regex)) {
            return true
        }
        return false
    }

    onChangeGender(e) {
        this.setState({ gender: e.target.value })
    }

    onChangeBirthYear(e) {
        this.setState({ yearOfBirth: e.target.value })
    }

    onSubmit(e) {
        e.preventDefault()
        console.log(user)
        const step = this.state.step
        if (step === 1) {
            const validationResult = this.validataionUserName(this.state.userName)
            this.setState({ validataionUserName: validationResult })
            if (validationResult) this.setState({ step: step + 1 })
        } else if (step === 2) {
            this.setState({ step: step + 1 })
        } else if (step === 3) {
            this.setState({ step: step + 1 })
            this.submit().then((() => {
                this.setState({ step: step + 1 })
            }).bind(this))
        }
    }

    async submit() {
        if (user.authenticated === false) {
            window.alert("Oops!。ログインしていないようです。")
            await signin()
        }
        console.log(this.state)
        return db.collection("users").doc(user.uid).set({
            name: this.state.userName,
            gender: this.state.gender,
            yearOfBirth: this.state.yearOfBirth
        }).catch((e) => {
            console.error(e)
        })
    }
}

export default withRouter(InitUserPage)