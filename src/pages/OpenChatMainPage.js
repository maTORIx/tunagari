import { db, firebase } from "../firebase"
import React from 'react';
import { Link } from "react-router-dom"
import '../App.css';
import Header from '../components/Header'

class OpenChatMainPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            formInput: "",
            formValidation: true,
            tags: [],
            errors: []
        }
        this.onChangeForm = this.onChangeForm.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.fetchTags()
    }

    render() {
        return (
            <div>
                <Header title="オープンな掲示板" />
                <div className="main-container">
                    <h2>タグ一覧</h2>
                    <div className="tag-list">
                        {this.renderTags()}
                    </div>
                    <h2>新規タグ</h2>
                    <form onSubmit={this.onSubmit}>
                        <input type="text" value={this.formValue} onChange={this.onChangeForm}></input>
                        <label>{this.state.formInput.length}/15</label>
                        {!this.state.formValidation && (<p>このタグは登録できません。最大文字数をオーバーしていませんか？。既存のタグは追加できません。スペースや特殊な文字を使っていませんか？</p>)}
                        <button type="submit">送信</button>
                    </form>

                </div>
            </div>
        )
    }

    renderTags() {
        let result = []
        for (let tag of this.state.tags) {
            result.push(
                <div key={`link_to_${tag.id}`}>
                    <Link to={`/open/${tag.id}`}>{tag.id}</Link>
                </div>
            )
        }
        return result
    }

    onChangeForm(e) {
        this.setState({
            formInput: e.target.value,
            formValidation: this.validationTagName(e.target.value)
        })
    }

    validationTagName(value) {
        console.log("validation")
        const regex = /^[a-zA-Z0-9ぁ-んァ-ヶ亜-熙_\(\)]+$/
        if (value.length < 15
            && value.length > 0
            && !this.state.tags.map((doc) => doc.id).includes(value)
            && value.match(regex)) {
            return true
        }
        return false
    }

    onSubmit(e) {
        let self = this
        e.preventDefault()
        let validationResult = this.validationTagName(this.state.formInput)
        this.setState({ formValidation: validationResult })
        if (!validationResult) {
            console.error(Error("Invalid form input."))
            return
        }
        db.collection("tags").doc(self.state.formInput).set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            let result = this.state.tags.concat([{
                id: this.state.formInput
            }])
            this.setState({ tags: result })
        }).catch((e) => {
            console.error(e)
            self.state.errors.push({
                error: e,
                message: "Failed to send form."
            })
        })
    }

    fetchTags() {
        let self = this
        db.collection("tags").get().then((querySnapshot) => {
            let tags = []
            querySnapshot.forEach((doc) => {
                tags.push(doc)
            })
            self.setState({ tags: tags })
        })
    }

}

export default OpenChatMainPage