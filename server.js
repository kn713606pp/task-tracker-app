const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

// MIME types 映射
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 解析 URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // 獲取文件擴展名
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // 設置 CORS 標頭
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 處理 OPTIONS 請求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 讀取並提供文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 檔案不存在，返回 404
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content || '404 - 頁面不存在', 'utf-8');
                });
            } else {
                // 服務器錯誤
                res.writeHead(500);
                res.end(`服務器錯誤: ${error.code}`, 'utf-8');
            }
        } else {
            // 成功提供文件
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 服務器運行在 http://localhost:${port}`);
    console.log(`📝 任務追蹤系統: http://localhost:${port}/index.html`);
    console.log(`🀄 麻將戰績系統: http://localhost:${port}/mahjong-session-tracker.html`);
    console.log(`🧪 Firebase 測試頁面: http://localhost:${port}/test-firebase.html`);
    console.log(`📖 設定指南: http://localhost:${port}/FIREBASE_SETUP.md`);
    console.log('');
    console.log('⚠️  注意：請先完成 Firebase 配置才能使用 Google 登入功能');
    console.log('   請參考 FIREBASE_SETUP.md 檔案中的設定步驟');
});