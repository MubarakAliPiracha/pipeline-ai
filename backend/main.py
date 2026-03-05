from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PipelineAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PipelineRequest(BaseModel):
    csv_data: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/generate-pipeline")
def generate_pipeline(request: PipelineRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=api_key)

    prompt = f"""You are an expert data engineer. Analyze this messy CSV data and generate a complete Python cleaning script.

CSV DATA:
{request.csv_data}

Analyze the data carefully and identify ALL issues such as:
- Missing/null values
- Duplicate rows
- Inconsistent capitalization
- Wrong data types (e.g. text in numeric columns)
- Inconsistent date formats
- Out of range values (e.g. completion over 100%)
- Empty column names

Respond in EXACTLY this format:

ISSUES:
- [list each issue found, one per line starting with -]

SCRIPT:
[complete standalone Python script using pandas that fixes all issues, loads from input.csv, saves to output.csv, prints a summary of what was fixed]

EXPLANATION:
[2-3 plain English sentences explaining what the script does and fixes]"""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    response_text = message.content[0].text

    script = ""
    explanation = ""
    issues = []

    try:
        if "ISSUES:" in response_text and "SCRIPT:" in response_text and "EXPLANATION:" in response_text:
            issues_raw = response_text.split("ISSUES:")[1].split("SCRIPT:")[0].strip()
            script = response_text.split("SCRIPT:")[1].split("EXPLANATION:")[0].strip()
            explanation = response_text.split("EXPLANATION:")[1].strip()
            issues = [line.lstrip("- ").strip() for line in issues_raw.split("\n") if line.strip().startswith("-")]
        else:
            script = response_text
            explanation = "Script generated successfully."
            issues = []
    except Exception:
        script = response_text
        explanation = "Script generated."
        issues = []

    return {"script": script, "explanation": explanation, "issues": issues}
