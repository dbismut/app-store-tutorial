import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router5';

import configureStore from './_redux/store';
import createRouter from './_router/router';
import dataMiddleware from './_router/dataMiddleware';
import routes from './_router/routes';

import registerServiceWorker from './registerServiceWorker';

import App from './App';

import './index.css';

const router = createRouter(routes);
const store = configureStore(router);

router.setDependency('store', store);
router.useMiddleware(dataMiddleware(routes));

const wrappedApp = (
  <Provider store={store}>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </Provider>
);

router.start((err, state) => {
  ReactDOM.render(wrappedApp, document.getElementById('root'));
});

registerServiceWorker();
