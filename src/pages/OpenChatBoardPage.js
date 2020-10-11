import React from 'react';
import { withRouter } from "react-router-dom"
import { db, user } from "../firebase"
import '../App.css';
import Header from '../components/Header'
import { setError } from '../error';

class OpenChatBoardPage extends React.Component {
    constructor(props) {
        super(props)
        this.tagName = this.props.match.params.tagName
        this.boardId = this.props.match.params.boardId
        this.state = {
            formUserNameInput: "",
            formUserNameInputValidation: true,
            formTextArea: "",
            formTextAreaValidation: true,
            chats: [],
            boardData: null,
            loading: true
        }
        this.fetchBoard()
        this.onChangeFormUserNameInput = this.onChangeFormUserNameInput.bind(this)
        this.onChangeTextArea = this.onChangeTextArea.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    render() {
        return (
            <div>
                <Header title={this.tagName} />
                {this.state.loading && (
                    <div>loading</div>
                )}
                {!this.state.loading && (
                    <div className="main-container">
                        <h1>{this.state.boardData.title}</h1>
                        {this.renderChats()}
                        <form onSubmit={this.onSubmit}>
                            <input value={this.state.formUserNameInput} onChange={this.onChangeFormUserNameInput} />
                            <label>{this.state.formUserNameInput.length} / 15</label>
                            <textarea value={this.state.formTextArea} onChange={this.onChangeTextArea} />
                            <div className="length-limit">{this.state.formTextArea.length}/1000</div>
                            <button type="submit">送信</button>
                        </form>
                    </div>
                )}
            </div>
        )
    }

    onChangeTextArea(e) {
        this.setState({
            formTextArea: e.target.value,
            formTextAreaValidation: this.chatContentValidation(e.target.value)
        })
    }

    chatContentValidation(value) {
        return value.length < 1000 && value.length > 0
    }

    onChangeFormUserNameInput(e) {
        this.setState({
            formUserNameInput: e.target.value,
            formUserNameInputValidation: this.validataionUserName(e.target.value)
        })
    }

    validataionUserName(userName) {
        const regex = /^[a-zA-Z0-9ぁ-んァ-ヶ亜-熙_()]+$/
        if (userName.length < 15
            && userName.length > 1
            && userName.match(regex)) {
            return true
        }
        return false
    }

    renderChats() {
        let result = []
        for (let chat of this.state.chats) {
            let data = chat.data()
            let createdAt = data.createdAt.toDate()
            let dateString = `${createdAt.getFullYear()}-${createdAt.getMonth()}-${createdAt.getDate()} ${createdAt.getHours()}:${createdAt.getMinutes()}:${createdAt.getSeconds()}`
            result.push(
                <div key={`chat_container_${chat.id}`} className="chat_container">
                    <div className="info">
                        <div className="user-name">{data.userName}</div>
                        <div className="create-at">{dateString}</div>
                        <div className="user-id">{data.uid}</div>
                    </div>
                    <div className="content">{data.content}</div>
                </div>
            )
        }
        return result
    }

    fetchBoard(boardId) {
        db.collection("boards").doc(this.boardId).get().then(async (doc) => {
            if (!doc.exists) {
                this.props.history.push("/NotFound")
                return
            } else if (doc.data().tagName !== this.tagName) {
                this.props.history.replace(`/open/${doc.data().tagName}/${this.boardId}`)
                return
            }
            this.setState({ boardData: doc.data(), loading: false })
            const addChats = ((querySnapshot) => {
                let chats = []
                querySnapshot.forEach((doc) => chats.push(doc))
                this.setState({ chats: this.state.chats.concat(chats) })
            })
            await db.collection("chats").where("boardId", "==", this.boardId).orderBy("createdAt").onSnapshot(addChats)
        }).catch(setError)
    }

    onSubmit(e) {
        e.preventDefault()
        let userNameValidation = this.userNameValidation(this.state.formUserNameInput)
        let contentValidation = this.contentValidation(this.state.formTextArea)
        if (!userNameValidation || !contentValidation) {
            this.setState({
                formTextAreaValidation: contentValidation,
                formUserNameInputValidation: userNameValidation
            })
        }
    }
}

export default withRouter(OpenChatBoardPage)