import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { routeNodeSelector } from 'redux-router5';
import CSSTransition from 'react-transition-group/CSSTransition';

import cn from 'classnames';

import { chain, composite, delay, spring, styler, tween } from 'popmotion';
import { cubicBezier } from 'popmotion/easing';
import scroll from 'stylefire/scroll';

import browser from 'bowser';

import './Post.css';

const DRAG_LIMIT = 50;
const DRAG_THRESHOLD = 100;
const DRAG_MINIMUM_SCALE = 0.8;
const CLOSE_INVERTED_THRESHOLD = 0.64;

const windowScroll = scroll();
const myEasing = cubicBezier(0.8, -0.25, 0.33, 1.52);

class Post extends PureComponent {
  from = {};
  to = {};

  state = {
    dragProgress: 0,
    closeInverted: false
  };

  componentDidMount() {
    this.postStyler = styler(this.post);
    this.postScroll = scroll(this.post);
  }

  componentWillUnmount = () => {
    this.removeListeners();
  };

  addListeners = () => {
    window.addEventListener('scroll', this.onScroll);
    window.addEventListener('touchstart', this.onTouchStart);
    window.addEventListener('touchend', this.onTouchEnd);
  };

  removeListeners = () => {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('touchstart', this.onTouchStart);
  };

  onTouchStart = () => (this.isTouching = true);

  onTouchEnd = () => (this.isTouching = false);

  onScroll = () => {
    const scrollTop = windowScroll.get('top');

    if (scrollTop < 0 && !this.isTransitioningFromDrag) {
      if (this.isTouching) this.isDragging = true;
      if (this.isDragging) {
        if (scrollTop > -DRAG_THRESHOLD) {
          const dragProgress = Math.min(1, -scrollTop / DRAG_LIMIT);
          this.setState({ dragProgress });
        } else {
          this.isTransitioningFromDrag = true;
          this.props.navigateTo('home');
        }
      }
      return;
    }

    this.setState({ dragProgress: 0 });
    this.isDragging = false;

    // handling close icon color
    const threshold = scrollTop / CLOSE_INVERTED_THRESHOLD;

    if (!this.state.closeInverted && threshold > window.innerHeight - 54) {
      this.setState({ closeInverted: true });
    } else if (
      this.state.closeInverted &&
      threshold <= window.innerHeight - 54
    ) {
      this.setState({ closeInverted: false });
    }
  };

  getPreviewStyleAndPosition = () => {
    const { top, width, height } = this.preview.getBoundingClientRect();

    const transformMatrix = window.getComputedStyle(this.preview).transform;
    // transformMatrix is either 'none', or a string in the form of
    // matrix(0.965, 0, 0, 0.965, 0, 0)

    const scale =
      transformMatrix.indexOf('matrix') === 0
        ? parseFloat(transformMatrix.split(', ')[3])
        : 1;

    return {
      top: top - height * (1 - scale) / 2,
      width: width / scale,
      height: height / scale,
      borderRadius: 16,
      scale
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

  onEntered = () => {
    this.addListeners();
  };

  onExit = () => {
    this.removeListeners();

    // we don't want to run this if there is no
    // preview element to transition to.
    if (!this.preview) return;

    const scale = 1 - this.state.dragProgress * (1 - DRAG_MINIMUM_SCALE);

    this.from = {
      top: 0,
      height: this.post.offsetHeight,
      width: this.post.offsetWidth,
      borderRadius: this.postStyler.get('borderRadius'),
      scale,
      scrollTop: windowScroll.get('top')
    };
    this.to = {
      ...this.getPreviewStyleAndPosition(),
      scrollTop: 0
    };
    if (this.isTransitioningFromDrag) {
      this.to.top += windowScroll.get('top');
    }

    const scrollTop = windowScroll.get('top');
    this.post.classList.add('scroll-block');
    this.postScroll.set('top', scrollTop);
  };

  executeEnteringTransition = (node, done) => {
    this.postStyler.set({ ...this.from, visibility: 'visible' });
    node.classList.add('post-enter-started');

    const hidePreview = () => (this.preview.style.visibility = 'hidden');
    if (browser.safari) setImmediate(hidePreview);
    else hidePreview();

    const {
      height: heightFrom,
      top: topFrom,
      scale: scaleFrom,
      ...mainFrom
    } = this.from;
    const { height: heightTo, top: topTo, scale: scaleTo, ...mainTo } = this.to;

    composite({
      heightAndTop: tween({
        from: { height: heightFrom, top: topFrom, scale: scaleFrom },
        to: { height: heightTo, top: topTo, scale: scaleTo },
        duration: 800,
        ease: myEasing
      }),
      main: chain(
        delay(500),
        tween({
          from: mainFrom,
          to: mainTo,
          duration: 250
        })
      )
    })
      .pipe(({ main, heightAndTop }) => ({ ...heightAndTop, ...main }))
      .start({
        update: this.postStyler.set,
        complete: () => {
          tween({ from: windowScroll.get('top'), to: 0 }).start({
            update: v => windowScroll.set('top', v),
            complete: () => {
              node.classList.remove('post-enter-started');
              this.post.style = null;
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

    const { closeInverted, dragProgress } = this.state;

    const postStyle =
      dragProgress > 0
        ? {
            transform: `scale(${1 - dragProgress * (1 - DRAG_MINIMUM_SCALE)})`,
            borderRadius: dragProgress * 16
          }
        : null;

    return (
      <CSSTransition
        {...transitionProps}
        appear
        onEnter={this.onEnter}
        onEntered={this.onEntered}
        onExit={this.onExit}
        addEndListener={this.onAddEndListener}
        classNames="post"
      >
        <div
          className={cn('page full-width page-post', {
            'post-dragged': dragProgress > 0
          })}
        >
          <div className="underlay" />
          <div
            ref={post => (this.post = post)}
            className="post full-width"
            style={postStyle}
          >
            <div
              className={cn('close', { invert: closeInverted })}
              onClick={() => navigateTo('home')}
            />
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
