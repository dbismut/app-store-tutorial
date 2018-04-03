import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { routeNodeSelector } from 'redux-router5';

import Preview from './Preview';

import './List.css';

class List extends PureComponent {
  render() {
    const { route, navigateTo } = this.props;
    const { posts } = route.data;

    return (
      <div className="page full-width page-list">
        <div className="list">
          {posts.map(({ id, ...rest }) => (
            <Preview
              key={id}
              id={id}
              {...rest}
              onClick={() => navigateTo('post', { id })}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default connect(state => routeNodeSelector('home'))(List);
