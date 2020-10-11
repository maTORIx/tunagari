import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom"

import IndexPage from './pages/IndexPage'
import OpenChatMainPage from './pages/OpenChatIndexPage'
import InitUserPage from "./pages/InitUserPage"
import OpenChatTagPage from "./pages/OpenChatTagPage"
import OpenChatBoardPage from "./pages/OpenChatBoardPage"

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={IndexPage} />
        <Route exact path="/open" component={OpenChatMainPage} />
        <Route exact path="/open/:tagName" component={OpenChatTagPage} />
        <Route path="/open/:tagName/:boardId" component={OpenChatBoardPage} />
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
