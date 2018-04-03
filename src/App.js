import React, { PureComponent } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions, routeNodeSelector } from 'redux-router5';

import TransitionGroup from 'react-transition-group/TransitionGroup';

import List from './List';
import Post from './Post';

import './App.css';

class App extends PureComponent {
  render() {
    const { route, navigateTo } = this.props;
    return (
      <div className="App">
        <List navigateTo={navigateTo} />
        <TransitionGroup>
          {route.name === 'post' && <Post navigateTo={navigateTo} />}
        </TransitionGroup>
      </div>
    );
  }
}

function mapActionsToProps(dispatch) {
  return bindActionCreators({ navigateTo: actions.navigateTo }, dispatch);
}

export default connect(state => routeNodeSelector(''), mapActionsToProps)(App);
