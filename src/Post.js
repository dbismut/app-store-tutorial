import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { routeNodeSelector } from 'redux-router5';
import CSSTransition from 'react-transition-group/CSSTransition';

import { chain, composite, delay, spring, styler, tween } from 'popmotion';
import { cubicBezier } from 'popmotion/easing';
import scroll from 'stylefire/scroll';

import './Post.css';

const windowScroll = scroll();
const myEasing = cubicBezier(0.8, -0.25, 0.33, 1.52);

class Post extends PureComponent {
  from = {};
  to = {};

  componentDidMount() {
    this.postStyler = styler(this.post);
    this.postScroll = scroll(this.post);
  }

  getPreviewStyleAndPosition = () => {
    const { top, width, height } = this.preview.getBoundingClientRect();

    return {
      top,
      width,
      height,
      borderRadius: 16,
      scale: 1
    };
  };

  onEnter = () => {
    const { post } = this.props.route.data;

    this.preview = document.querySelector(`.preview[data-id="${post.id}"]`);
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

  onExit = () => {
    // we don't want to run this if there is no
    // preview element to transition to.
    if (!this.preview) return;

    this.from = {
      top: 0,
      height: this.post.offsetHeight,
      width: this.post.offsetWidth,
      borderRadius: this.postStyler.get('borderRadius'),
      scrollTop: windowScroll.get('top')
    };
    this.to = {
      ...this.getPreviewStyleAndPosition(),
      scrollTop: 0
    };

    const scrollTop = windowScroll.get('top');
    this.post.classList.add('scroll-block');
    this.postScroll.set('top', scrollTop);
  };

  executeEnteringTransition = (node, done) => {
    this.postStyler.set({ ...this.from, visibility: 'visible' });
    this.preview.style.visibility = 'hidden';

    tween({
      to: this.to,
      from: this.from,
      duration: 800,
      ease: myEasing
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

  executeExitingTransition = (node, done) => {
    spring({
      from: this.from,
      to: this.to,
      stiffness: 100,
      damping: 12,
      restDelta: true,
      restSpeed: 0.1
    }).start({
      update: ({ scrollTop, ...rest }) => {
        this.postStyler.set(rest);
        this.postScroll.set('top', scrollTop);
      },
      complete: () => {
        this.preview.style.visibility = 'visible';

        // freeing the page list node
        const scrollTop = -this.pageListStyler.get('top');
        this.pageListStyler.set({ position: 'absolute', top: 0 });
        windowScroll.set('top', scrollTop);
        done();
      }
    });
  };

  onAddEndListener = (node, done) => {
    if (!this.preview) return done();
    // This makes sure we don't run the animation when
    // we don't have a preview element available.
    // This happens when loading the Post directly without
    // going through the list page first.

    const { in: inProp } = this.props;

    if (inProp) {
      const { image } = this.props.route.data.post;

      const img = new Image();
      img.src = `/img/${image}`;

      if (!img.complete) {
        img.onload = () => this.executeEnteringTransition(node, done);
        return;
      }
      this.executeEnteringTransition(node, done);
    } else {
      this.executeExitingTransition(node, done);
    }
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
        onExit={this.onExit}
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
