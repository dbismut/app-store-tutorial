import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { routeNodeSelector } from 'redux-router5';
import CSSTransition from 'react-transition-group/CSSTransition';

import './Post.css';

class Post extends PureComponent {
  render() {
    const {
      navigateTo,
      route,
      dispatch,
      previousRoute,
      ...transitionProps
    } = this.props;

    const { post } = route.data;
    const { title, image, content } = post;

    return (
      <CSSTransition timeout={1000} {...transitionProps} classNames="post">
        <div className="page full-width page-post">
          <div className="post full-width">
            <div className="close" onClick={() => navigateTo('home')} />
            <div className="cover-wrapper">
              <div
                className="cover"
                style={{ backgroundImage: `url(/img/${image})` }}
              />
              <h1 className="title">{title}</h1>
            </div>
            <div className="content full-width">{content}</div>
          </div>
        </div>
      </CSSTransition>
    );
  }
}

export default connect(state => routeNodeSelector('post'))(Post);
