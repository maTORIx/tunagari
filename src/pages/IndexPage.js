import React from 'react';
import '../App.css';
import Header from '../components/Header'

class IndexPage extends React.Component {
    render() {
        return (
            <div>
                <Header title="tunagari.net" />
                <div className="main-container"></div>
            </div>
        )
    }
}

export default IndexPage