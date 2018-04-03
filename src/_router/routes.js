import posts from './postData';

export default [
  {
    name: 'home',
    path: '/',
    onActivate: () =>
      Promise.resolve({
        posts: posts.map(({ content, ...rest }) => rest)
      })
  },
  {
    name: 'post',
    path: '/post/:id',
    onActivate: params =>
      Promise.resolve({ post: posts.find(({ id }) => id === params.id) })
  }
];
