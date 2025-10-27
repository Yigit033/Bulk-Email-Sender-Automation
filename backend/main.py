from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import httpx
import os
from typing import List
import asyncio
from dotenv import load_dotenv
from io import BytesIO
import openpyxl

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Email Sender API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailRequest(BaseModel):
    subject: str
    body: str
    recipients: List[EmailStr]

class EmailResult(BaseModel):
    email: str
    success: bool
    message: str

class EmailResponse(BaseModel):
    total: int
    successful: int
    failed: int
    results: List[EmailResult]

def format_email_body(text_body: str) -> str:
    """
    Convert plain text to simple HTML format preserving line breaks.
    """
    import html
    escaped_text = html.escape(text_body)
    # Replace newlines with <br> tags
    formatted_body = escaped_text.replace('\n', '<br>')
    return formatted_body

async def send_single_email(recipient: str, subject: str, body: str, api_key: str) -> EmailResult:
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Format the body as professional HTML
    formatted_body = format_email_body(body)
    
    payload = {
        "from": "Yiğit Tilaver <gmail@yigittilaver.dev>",
        "to": recipient,
        "subject": subject,
        "html": formatted_body
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=10.0)

            if response.status_code == 200:
                return EmailResult(
                    email=recipient,
                    success=True,
                    message="Email sent successfully"
                )
            else:
                error_detail = response.json().get("message", response.text)
                return EmailResult(
                    email=recipient,
                    success=False,
                    message=f"Failed: {error_detail}"
                )
    except Exception as e:
        return EmailResult(
            email=recipient,
            success=False,
            message=f"Error: {str(e)}"
        )

@app.post("/send-emails", response_model=EmailResponse)
async def send_emails(request: EmailRequest):
    api_key = os.getenv("RESEND_API_KEY")

    if not api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY not configured")

    if not request.recipients:
        raise HTTPException(status_code=400, detail="No recipients provided")

    # Send emails sequentially to respect rate limits (2 requests/second)
    results = []
    for recipient in request.recipients:
        result = await send_single_email(recipient, request.subject, request.body, api_key)
        results.append(result)
        # Wait 0.5 seconds between requests to stay under rate limit
        if recipient != request.recipients[-1]:  # Don't wait after last email
            await asyncio.sleep(0.5)

    successful = sum(1 for r in results if r.success)
    failed = len(results) - successful

    return EmailResponse(
        total=len(results),
        successful=successful,
        failed=failed,
        results=results
    )

@app.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    """
    Upload Excel file and extract email addresses from the first column.
    Returns a list of email addresses.
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    
    try:
        # Read file content
        contents = await file.read()
        workbook = openpyxl.load_workbook(BytesIO(contents))
        
        # Get the first sheet
        sheet = workbook.active
        
        # Extract emails from first column, skipping empty cells
        emails = []
        for row in sheet.iter_rows(values_only=True):
            if row[0] and isinstance(row[0], str) and '@' in row[0]:
                email = str(row[0]).strip()
                # Basic email validation
                if email and '@' in email:
                    emails.append(email)
        
        return {"emails": emails, "count": len(emails)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading Excel file: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
