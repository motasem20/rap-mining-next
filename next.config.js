// rap-mining-next/next.config.js
module.exports = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "/api/:path*" },
    ];
  },
  output: "standalone",
};
