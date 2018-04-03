import createRouter from 'router5';
import browserPlugin from 'router5/plugins/browser';
import loggerPlugin from 'router5/plugins/logger';

export default function configureRouter(routes, options = {}) {
  const router = createRouter(routes, options)
    // Plugins
    .usePlugin(browserPlugin({ useHash: false }));

  if (process.env.NODE_ENV === 'development') router.usePlugin(loggerPlugin);

  // prevent automatic scroll restauration
  if (window.history.scrollRestoration)
    window.history.scrollRestoration = 'manual';

  return router;
}
