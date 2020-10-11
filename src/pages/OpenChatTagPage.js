import React from 'react';
import { Link, withRouter } from "react-router-dom"
import '../App.css';
import Header from '../components/Header'
import { setError } from '../error';
import { firebase, db, user, defaultUserData } from '../firebase'
import LoadingSVG from '../loading-black.svg'

class OpenChatTagPage extends React.Component {
    constructor(props) {
        super(props)
        this.tagName = this.props.match.params.tagName
        this.state = {
            boards: [],
            formTitleInput: "",
            formTitleInputValidation: true,
            formUserNameInput: defaultUserData.name,
            formUserNameValidation: true,
            formTextArea: "",
            formTextAreaValidation: true,
            sending: false
        }
        this.onChangeFormTitleInput = this.onChangeFormTitleInput.bind(this)
        this.onChangeTextArea = this.onChangeTextArea.bind(this)
        this.onChangeFormUserNameInput = this.onChangeFormUserNameInput.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.fetchBoards()
    }

    render() {
        return (
            <div>
                <Header title={'オープンな掲示板'} />
                <div className="main-container">
                    <h2>{this.tagName}</h2>
                    {this.renderBoards()}
                    <h2>スレ新規作成</h2>
                    <form onSubmit={this.onSubmit}>
                        <input value={this.state.formTitleInput} onChange={this.onChangeFormTitleInput} className={!this.state.formTitleInputValidation && "failed"} />
                        <label>{this.state.formTitleInput.length}/100</label>
                        <input value={this.state.formUserNameInput} onChange={this.onChangeFormUserNameInput} className={!this.state.formUserNameValidation && "failed"} />
                        <label>{this.state.formUserNameInput.length} / 15</label>
                        <textarea value={this.state.formTextArea} onChange={this.onChangeTextArea} className={!this.state.formTextAreaValidation && "failed"} />
                        <div className="length-limit">{this.state.formTextArea.length}/1000</div>
                        <button type="submit" className={this.state.sending && "loading"}>作成</button>
                        <img src={LoadingSVG} alt="loading-icon" className='loading-icon' />
                    </form>
                </div>
            </div>
        )
    }

    onChangeFormTitleInput(e) {
        this.setState({
            formTitleInput: e.target.value,
            formTitleInputValidation: this.boardTitleValidation(e.target.value)
        })
    }

    boardTitleValidation(value) {
        return value.length < 100 && value.length > 0
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
            formUserNameValidation: this.validataionUserName(e.target.value)
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

    renderBoards() {
        let result = []
        for (let board of this.state.boards) {

            result.push(
                <Link className="board-container" key={`link_to_${board.id}`} to={`/open/${this.tagName}/${board.id}`}>
                    <h3>{board.data().title}</h3>
                    <p className="wrap">{board.data().firstContent}</p>
                </Link>
            )
        }
        return result
    }

    fetchBoards() {
        db.collection("boards").where("tagName", "==", this.tagName).get().then((querySnapshot) => {
            let boards = []
            querySnapshot.forEach((doc) => {
                boards.push(doc)
            })
            this.setState({ boards: boards })
        })
    }

    onSubmit(e) {
        e.preventDefault()
        const titleValidation = this.boardTitleValidation(this.state.formTitleInput)
        const contentValidation = this.chatContentValidation(this.state.formTextArea)
        let createdBoardId = null
        if (!titleValidation || !contentValidation) {
            this.setState({
                formTitleInputValidation: titleValidation,
                formTextAreaValidation: contentValidation
            })
            return
        }
        this.setState({ sending: true })
        db.collection("boards").add({
            tagName: this.tagName,
            title: this.state.formTitleInput,
            firstContent: this.state.formTextArea,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(async (doc) => {
            createdBoardId = doc.id
            let promise1 = this.attachBoard(doc.id)
            let promise2 = db.collection("chats").add({
                boardId: doc.id,
                uid: user.uid,
                userName: user.data.name,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                content: this.state.formTextArea
            }).catch(setError)

            await Promise.all([promise1, promise2])
            this.setState({ sending: false })
            this.props.history.push(`/open/${this.tagName}/${createdBoardId}`)
        }).catch(setError)
    }

    attachBoard(boardId) {
        return db.collection("userHistory").doc(user.uid).update({
            attachedBoards: firebase.firestore.FieldValue.arrayUnion(boardId)
        }).catch((error) => {
            return db.collection("userHistory").doc(user.uid).set({
                attachedBoards: [boardId]
            })
        }).catch(setError)
    }
}

export default withRouter(OpenChatTagPage)