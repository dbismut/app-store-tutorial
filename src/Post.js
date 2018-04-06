import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { routeNodeSelector } from 'redux-router5';
import CSSTransition from 'react-transition-group/CSSTransition';

import { chain, composite, delay, spring, styler, tween } from 'popmotion';
import { cubicBezier } from 'popmotion/easing';
import scroll from 'stylefire/scroll';

import './Post.css';

const windowScroll = scroll();

class Post extends PureComponent {
  from = {};
  to = {};

  componentDidMount() {
    this.postStyler = styler(this.post);
    this.postScroll = scroll(this.post);
  }

  getPreviewStyleAndPosition = () => {
    const {
      top: previewTop,
      width: previewWidth,
      height: previewHeight
    } = this.preview.getBoundingClientRect();

    return {
      top: previewTop,
      width: previewWidth,
      height: previewHeight,
      borderRadius: 16
    };
  };

  getTo = () => {
    return {
      top: 0,
      height: window.innerHeight,
      width: document.body.offsetWidth,
      borderRadius: 0
    };
  };

  onEnter = () => {
    const { post } = this.props.route.data;

    this.preview = document.querySelector(`.preview[data-id="${post.id}"]`);
    if (!this.preview) return;

    this.pageList = document.querySelector('.page-list');
    this.pageListStyler = styler(this.pageList);

    this.from = this.getPreviewStyleAndPosition();
    this.to = {
      top: 0,
      height: window.innerHeight,
      width: document.body.offsetWidth,
      borderRadius: 0,
      scale: 1
    };

    const scrollTop = windowScroll.get('top');
    this.pageListStyler.set({ position: 'fixed', top: -scrollTop });
    windowScroll.set('top', 0);
  };

  executeEnteringTransition = (node, done) => {
    this.postStyler.set({ ...this.from, visibility: 'visible' });

    tween({
      to: this.to,
      from: this.from,
      duration: 1000
    }).start({
      update: this.postStyler.set,
      complete: () => {
        tween({ from: windowScroll.get('top'), to: 0 }).start({
          update: v => windowScroll.set('top', v),
          complete: () => {
            done();
          }
        });
      }
    });
  };

  onAddEndListener = (node, done) => {
    if (!this.preview) return done();
    // This makes sure we don't run the animation when
    // we don't have a preview element available in onEnter.
    // This happens when loading the Post directly without
    // going through the list page first.

    const { image } = this.props.route.data.post;

    const img = new Image();
    img.src = `/img/${image}`;

    if (!img.complete) {
      img.onload = () => this.executeEnteringTransition(node, done);
      return;
    }
    this.executeEnteringTransition(node, done);
  };

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
      <CSSTransition
        {...transitionProps}
        onEnter={this.onEnter}
        addEndListener={this.onAddEndListener}
        classNames="post"
      >
        <div className="page full-width page-post">
          <div ref={post => (this.post = post)} className="post full-width">
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
