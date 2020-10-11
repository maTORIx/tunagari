import firebase from "firebase/app"
import "firebase/firebase-auth"
import "firebase/firebase-firestore"
import { setError } from "./error"

var firebaseConfig = {
    apiKey: "AIzaSyDcRHJWndJ8GQhk1Br8fgpBXHOEOHNTMCE",
    authDomain: "todoist-d68b7.firebaseapp.com",
    databaseURL: "https://todoist-d68b7.firebaseio.com",
    projectId: "todoist-d68b7",
    storageBucket: "todoist-d68b7.appspot.com",
    messagingSenderId: "999654833977",
    appId: "1:999654833977:web:8439da5fd820e7dc4a32e8"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function createDB() {
    let db = firebase.firestore();
    if (window.location.hostname === "localhost") {
        db.settings({
            host: "localhost:8080",
            ssl: false
        });
    }
    return db
}

let db = createDB()


const userLoadedEvent = new Event("userLoaded")

const defaultUserData = {
    "name": "ななしさん"
}

let user = {
    authenticated: false,
    data: defaultUserData,
    uid: null,
    initialized: false
}

// if logged in
firebase.auth().onAuthStateChanged((currentUser) => {
    if (currentUser === null) {
        return firebase.auth().signInAnonymously().then(() => {
            document.dispatchEvent(userLoadedEvent)
        })
    }
    user.authenticated = !currentUser.isAnonymous
    user.uid = currentUser.uid
    return loadUserData(currentUser.uid)
})

function signin() {
    let provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider).then((result) => {
        user.authenticated = true
        user.uid = result.user.uid
        return loadUserData(user.uid)
    }).catch(function (error) {
        setError(error)
    })
}

async function loadUserData(uid) {
    if (localStorage.getItem("userData") !== null) {
        user.data = JSON.parse(localStorage.getItem("userData"))
        user.initialized = true
    }
    let doc = await db.collection("users").doc(user.uid).get()
    if (doc.exists) {
        localStorage.setItem("userData", JSON.stringify(doc.data()))
        user.data = doc.data()
        user.initialized = true
    }
    document.dispatchEvent(userLoadedEvent)
}

function signout() {
    if (!user.authenticated) throw Error("User is not logged in.")
    return firebase.auth().signOut().then(() => {
        localStorage.removeItem("userData")
        user = {
            authenticated: false,
            data: defaultUserData,
            uid: null
        }
    }).catch((error) => {
        setError(error)
    })
}


export { firebase, db, signin, signout, user, defaultUserData }