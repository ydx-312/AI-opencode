const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 3000;
const dir = path.resolve(__dirname);
const MIME = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css',
    'js': 'application/javascript'
};
http.createServer((req, res) => {
    let fp = path.join(dir, req.url === '/' ? 'index.html' : req.url);
    fp = path.normalize(fp);
    if (!fp.startsWith(dir)) { res.writeHead(403); res.end(); return; }
    fs.stat(fp, (err, stat) => {
        if (err) { res.writeHead(404); res.end('404'); return; }
        if (stat.isDirectory()) fp = path.join(fp, 'index.html');
        const ext = path.extname(fp).slice(1);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
        fs.createReadStream(fp).pipe(res);
    });
}).listen(port, () => console.log('奥数训练题库服务已启动: http://localhost:' + port));
