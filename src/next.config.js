//src>>next.config.js
module.exports = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://activus-server-production.up.railway.app/api/:path*',
        },
      ];
    },
  };
  