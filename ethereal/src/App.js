import React, { Component } from 'react';
import ProfilePage from './components/ProfilePage/ProfilePage';
import PlayerPage from './components/PlayerPage/PlayerPage';
import HomePage from './components/HomePage/home';
import SearchPage from './components/SearchPage/SearchPage';
import ResultPage from './components/ResultPage/ResultPage';
import LoginPage from './components/LoginPage/LoginPage';
import ArtistPage from './components/ArtistPage/ArtistPage';
import {BrowserRouter as Router, Route, Link, IndexRoute} from 'react-router-dom';
import render from 'react-dom';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route path="/home" component={HomePage}></Route>
          <Route path="/profile" component={ProfilePage}></Route>
          <Route path="/player" component={PlayerPage}></Route>
          <Route path="/artist" component={ArtistPage}></Route>
          <Route path="/search" component={SearchPage}></Route>
          <Route path="/result" component={ResultPage}></Route>
          <Route path="/login" component={LoginPage}></Route>
        </div>
      </Router>
    )
  }
}
export default App;
