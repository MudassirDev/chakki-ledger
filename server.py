import http.server
import os
import socketserver

# Specify the custom path
custom_path = "/chakki-ledger"

# Change the working directory to where the folder is
os.chdir("./")  # change to the parent directory where `chakki-learning` is located


# Custom request handler that appends `/chakki-ledger` to the URL
class MyRequestHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Add the custom path to the URL
        if path.startswith(custom_path):
            path = path[len(custom_path) :]
        return super().translate_path(path)


# Set the port (use any port, for example 8000)
PORT = 8000

with socketserver.TCPServer(("", PORT), MyRequestHandler) as httpd:
    print(f"Serving at http://localhost:{PORT}{custom_path}")
    httpd.serve_forever()


# start the server with this:
# watchmedo auto-restart --patterns="*.py" --recursive -- python3 server.py
