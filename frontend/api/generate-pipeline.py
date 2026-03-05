from http.server import BaseHTTPRequestHandler
import json
import os
import anthropic

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length))
        csv_data = body.get("csv_data", "")

        client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

        prompt = f"""You are an expert data engineer. Analyze this messy CSV data.

CSV DATA:
{csv_data}

Respond in EXACTLY this format:

ISSUES:
- [list each issue found]

SCRIPT:
[complete Python pandas cleaning script]

EXPLANATION:
[2-3 sentences explaining what it fixes]"""

        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text
        script, explanation, issues = "", "", []

        try:
            if "ISSUES:" in response_text and "SCRIPT:" in response_text:
                issues_raw = response_text.split("ISSUES:")[1].split("SCRIPT:")[0].strip()
                script = response_text.split("SCRIPT:")[1].split("EXPLANATION:")[0].strip()
                explanation = response_text.split("EXPLANATION:")[1].strip()
                issues = [l.lstrip("- ").strip() for l in issues_raw.split("\n") if l.strip().startswith("-")]
            else:
                script = response_text
                explanation = "Script generated."
        except Exception:
            script = response_text

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({
            "script": script,
            "explanation": explanation,
            "issues": issues
        }).encode())
