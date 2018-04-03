import { applyMiddleware, compose, createStore } from 'redux';
import { router5Middleware } from 'redux-router5';
import { createLogger } from 'redux-logger';

import rootReducer from './actions';

const enhancers = [];

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.devToolsExtension;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

export default function configureStore(router, initialState = {}) {
  const middleware = [router5Middleware(router)];

  if (process.env.NODE_ENV === 'development') {
    middleware.push(createLogger());
  }

  const createStoreWithMiddleware = compose(
    applyMiddleware(...middleware),
    ...enhancers
  )(createStore);
  const store = createStoreWithMiddleware(rootReducer, initialState);

  return store;
}
