from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.request
import traceback

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length))
            csv_data = body.get("csv_data", "")

            api_key = os.environ.get("ANTHROPIC_API_KEY", "")
            if not api_key:
                self._respond(500, {"error": "ANTHROPIC_API_KEY not set"})
                return

            prompt = f"""You are an expert data engineer. Analyze this messy CSV data.

CSV DATA:
{csv_data}

Respond in EXACTLY this format:

ISSUES:
- [list each issue found]

SCRIPT:
[complete Python pandas cleaning script that loads input.csv, fixes issues, saves output.csv]

EXPLANATION:
[2-3 sentences explaining what it fixes]"""

            payload = json.dumps({
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 2000,
                "messages": [{"role": "user", "content": prompt}]
            }).encode()

            req = urllib.request.Request(
                "https://api.anthropic.com/v1/messages",
                data=payload,
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=55) as res:
                result = json.loads(res.read())

            response_text = result["content"][0]["text"]
            script, explanation, issues = "", "", []

            if "ISSUES:" in response_text and "SCRIPT:" in response_text and "EXPLANATION:" in response_text:
                issues_raw = response_text.split("ISSUES:")[1].split("SCRIPT:")[0].strip()
                script = response_text.split("SCRIPT:")[1].split("EXPLANATION:")[0].strip()
                explanation = response_text.split("EXPLANATION:")[1].strip()
                issues = [l.lstrip("- ").strip() for l in issues_raw.split("\n") if l.strip().startswith("-")]
            else:
                script = response_text
                explanation = "Script generated."

            self._respond(200, {"script": script, "explanation": explanation, "issues": issues})

        except Exception as e:
            self._respond(500, {"error": str(e), "trace": traceback.format_exc()})

    def _respond(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass
