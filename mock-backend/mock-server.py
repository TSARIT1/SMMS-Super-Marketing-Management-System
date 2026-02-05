from http.server import BaseHTTPRequestHandler, HTTPServer
import json

HOST = '0.0.0.0'
PORT = 8080

active_plan = {
    'id': 1,
    'planName': 'Demo Plan',
    'price': 0,
    'durationDays': 30,
    'maxProducts': -1,
    'maxUsers': 5,
    'status': 'ACTIVE',
    'description': 'Local mock active plan'
}

admin_user = {
    'id': 1,
    'name': 'Super Admin',
    'email': 'admin@supermart.com',
    'role': 'SUPER_ADMIN'
}

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)
        self.wfile.write(b'')

    def do_GET(self):
        if self.path == '/api/subscription-plans/active':
            self._set_headers(200)
            self.wfile.write(json.dumps(active_plan).encode())
            return
        if self.path == '/api/subscription-plans':
            self._set_headers(200)
            self.wfile.write(json.dumps([active_plan]).encode())
            return
        if self.path.startswith('/api/'):
            self._set_headers(200)
            self.wfile.write(json.dumps({'message': 'Mock backend', 'route': self.path}).encode())
            return
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/admin/login':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length).decode() if length else '{}'
            try:
                data = json.loads(body)
            except Exception:
                data = {}
            if data.get('email') == 'admin@supermart.com':
                self._set_headers(200)
                self.wfile.write(json.dumps({'user': admin_user, 'token': 'mock-token-123'}).encode())
            else:
                self._set_headers(401)
                self.wfile.write(json.dumps({'error': 'Invalid credentials - mock'}).encode())
            return
        self._set_headers(200)
        self.wfile.write(json.dumps({'message': 'Mock POST', 'path': self.path}).encode())

if __name__ == '__main__':
    server = HTTPServer((HOST, PORT), Handler)
    print(f'Mock backend listening on http://{HOST}:{PORT}')
    server.serve_forever()
