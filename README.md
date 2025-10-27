# 📧 Bulk Email Sender

A production-ready web application for sending the same email to multiple recipients individually. Built with FastAPI backend and Next.js 15 frontend.

## ✨ Features

- Send personalized emails to multiple recipients
- Each email sent separately (no CC/BCC visibility)
- Real-time progress tracking
- Success/failure reporting for each recipient
- Modern, responsive UI with dark mode support
- HTML email support
- Email validation
- Async processing for better performance

## 🏗️ Project Structure

```
/
├── backend/                 # FastAPI Backend
│   ├── main.py             # API endpoints and Resend integration
│   ├── requirements.txt    # Python dependencies
│   ├── runtime.txt         # Python version
│   └── .env.example        # Environment variables template
│
├── app/                    # Next.js 15 Frontend (App Router)
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   └── api/
│       └── config.ts      # API configuration
│
├── components/
│   ├── email-sender-form.tsx  # Main email form component
│   └── ui/                    # shadcn/ui components
│
└── .env.local.example     # Frontend environment variables
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Resend API key ([Get one here](https://resend.com))

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Add your Resend API key to `.env`:
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

6. Run the backend:
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the project root directory

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```

4. The default configuration points to `http://localhost:8000`. Update if needed:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Deployment

### Backend Deployment (Render.com)

1. Create a new Web Service on [Render](https://render.com)

2. Connect your Git repository

3. Configure the service:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

4. Add environment variable:
   - Key: `RESEND_API_KEY`
   - Value: Your Resend API key

5. Deploy!

Your backend will be available at: `https://your-app.onrender.com`

### Backend Deployment (Railway.app)

1. Create a new project on [Railway](https://railway.app)

2. Deploy from GitHub repository

3. Configure service:
   - **Root Directory**: `backend`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. Add environment variable:
   - `RESEND_API_KEY`: Your Resend API key

5. Railway will automatically detect Python and install dependencies

### Frontend Deployment (Vercel)

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and import your repository

3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (project root)

4. Add environment variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: Your backend URL (e.g., `https://your-app.onrender.com`)

5. Deploy!

Your frontend will be available at: `https://your-app.vercel.app`

## 🔧 API Documentation

### POST `/send-emails`

Send emails to multiple recipients.

**Request Body:**
```json
{
  "subject": "Your Email Subject",
  "body": "<p>Your HTML email content</p>",
  "recipients": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

**Response:**
```json
{
  "total": 3,
  "successful": 2,
  "failed": 1,
  "results": [
    {
      "email": "user1@example.com",
      "success": true,
      "message": "Email sent successfully"
    },
    {
      "email": "user2@example.com",
      "success": true,
      "message": "Email sent successfully"
    },
    {
      "email": "user3@example.com",
      "success": false,
      "message": "Failed: Invalid email address"
    }
  ]
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## 🎨 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Beautiful UI components
- **Lucide React** - Icons

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **httpx** - Async HTTP client
- **Resend API** - Email delivery service

## 🔐 Security Notes

- API keys are stored in environment variables
- CORS is configured (update for production)
- Email validation on both frontend and backend
- Rate limiting should be added for production use
- Consider adding authentication for production

## 📝 Development

### Run Tests

Backend:
```bash
cd backend
pytest  # (tests not included in this starter)
```

Frontend:
```bash
npm run test  # (tests not included in this starter)
```

### Type Checking

Frontend:
```bash
npm run typecheck
```

### Linting

Frontend:
```bash
npm run lint
```

### Build

Frontend:
```bash
npm run build
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `RESEND_API_KEY not configured`
- **Solution**: Ensure `.env` file exists with valid API key

**Problem**: CORS errors
- **Solution**: Update `allow_origins` in `main.py` for production

### Frontend Issues

**Problem**: Cannot connect to backend
- **Solution**: Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Problem**: Build fails
- **Solution**: Run `npm install` and ensure all dependencies are installed

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues related to:
- **Resend API**: Visit [Resend Documentation](https://resend.com/docs)
- **Next.js**: Visit [Next.js Documentation](https://nextjs.org/docs)
- **FastAPI**: Visit [FastAPI Documentation](https://fastapi.tiangolo.com)

---

Built with ❤️ using modern web technologies
