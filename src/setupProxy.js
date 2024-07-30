// src/setupProxy.js

import { createProxyMiddleware } from 'http-proxy-middleware';

export default function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://3.110.102.5',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '',
      },
    })
  );
}
