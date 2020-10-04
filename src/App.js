import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"

import IndexPage from './pages/IndexPage'
import OpenChatMainPage from './pages/OpenChatMainPage'
import InitUserPage from "./pages/InitUserPage"

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <IndexPage />
        </Route>
        <Route path="/open">
          <OpenChatMainPage />
        </Route>
        <Route path="/local">
          <div>制作中侍</div>
        </Route>
        <Route path="/init">
          <InitUserPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
