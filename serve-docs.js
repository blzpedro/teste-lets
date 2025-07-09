const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;

const mimeTypes = {
  '.html': 'text/html',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.css': 'text/css'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  if (pathname === '/') {
    pathname = '/swagger-ui.html';
  }

  const filePath = path.join(__dirname, pathname);
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>404 - File Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The requested file ${pathname} was not found.</p>
            <p>Available files:</p>
            <ul>
              <li><a href="/swagger-ui.html">Swagger UI</a></li>
              <li><a href="/swagger.yaml">OpenAPI Specification</a></li>
            </ul>
          </body>
        </html>
      `);
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Swagger documentation server running at http://localhost:${PORT}`);
  console.log(`📖 Open your browser and navigate to: http://localhost:${PORT}/swagger-ui.html`);
  console.log(`📋 API Specification available at: http://localhost:${PORT}/swagger.yaml`);
  console.log(`\nPress Ctrl+C to stop the server`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try a different port:`);
    console.error(`   PORT=8081 node serve-docs.js`);
  } else {
    console.error('❌ Server error:', err);
  }
}); 