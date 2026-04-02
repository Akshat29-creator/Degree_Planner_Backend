const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const HTML_FILE = path.join(__dirname, 'index.html');

const server = http.createServer((req, res) => {
  // CORS headers so fetch requests from browser work
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    fs.readFile(HTML_FILE, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error reading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`🛠  Developer Panel running at http://localhost:${PORT}`);
  console.log(`   → Open in browser to toggle feature flags`);
  console.log(`   → Backend API must be at http://localhost:8000`);
});
