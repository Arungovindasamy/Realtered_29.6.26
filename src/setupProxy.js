const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/haatza-api",
    createProxyMiddleware({
      target: "https://haatza.com",
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        "^/haatza-api": ""
      },
      on: {
        error: function (err, req, res) {
          console.error("[proxy] error:", err.message, "for", req.url);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Proxy error: " + err.message);
        }
      }
    })
  );
};

