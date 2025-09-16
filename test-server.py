#!/usr/bin/env python3
"""
簡單的 HTTP 測試伺服器
用於測試 Firebase Google 登入功能
"""

import http.server
import socketserver
import os
import sys

def run_server(port=8000):
    """啟動測試伺服器"""
    
    # 切換到網頁目錄
    os.chdir('/home/user/webapp')
    
    # 創建請求處理器
    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            """自定義日誌格式"""
            sys.stdout.write(f"{self.log_date_time_string()} - {format%args}\n")
            sys.stdout.flush()
            
        def end_headers(self):
            """添加 CORS 標頭以支援 Firebase"""
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            super().end_headers()
    
    # 啟動伺服器
    with socketserver.TCPServer(("0.0.0.0", port), MyHTTPRequestHandler) as httpd:
        print(f"🚀 測試伺服器已啟動")
        print(f"📍 本地地址: http://localhost:{port}")
        print(f"📍 網路地址: http://0.0.0.0:{port}")
        print(f"📂 服務目錄: {os.getcwd()}")
        print(f"📄 可用頁面:")
        print(f"   - http://localhost:{port}/index.html (任務追蹤系統)")
        print(f"   - http://localhost:{port}/mahjong-session-tracker.html (麻將戰績系統)")
        print("\n按 Ctrl+C 停止伺服器")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 伺服器已停止")
            return

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='啟動 Firebase 測試伺服器')
    parser.add_argument('--port', '-p', type=int, default=8000,
                        help='伺服器埠號 (預設: 8000)')
    
    args = parser.parse_args()
    run_server(args.port)