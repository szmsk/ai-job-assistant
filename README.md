# ⚡ AI Job Application Assistant

A client-side web app that analyses how well your CV matches a job posting and generates a tailored cover letter — powered by the **Claude API** (Anthropic).

![AI Job Assistant Screenshot](screenshot.png)

## Features

- **Match score** — honest 0–100% assessment of skill overlap
- **Visual breakdown** — matched requirements and gaps shown as tags
- **Tailored cover letter** — generated in English, ready to send
- **Pre-submission tips** — concrete advice before you apply
- **100% client-side** — your CV and API key never leave your browser
- **No backend, no database, no tracking**

## Live Demo

👉 [szmsk.github.io/ai-job-assistant](https://your-github-username.github.io/ai-job-assistant)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| AI | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Fonts | DM Sans + DM Mono (Google Fonts) |
| Hosting | GitHub Pages |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ai-job-assistant.git
cd ai-job-assistant
```

### 2. Open locally

Just open `index.html` in your browser — no build step, no npm, no dependencies.

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

### 3. Get an API key

Go to [console.anthropic.com](https://console.anthropic.com), create an account, and generate an API key. Paste it into the app — it's only stored in your browser session.

### 4. Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → `main` → `/ (root)`
4. Your app will be live at `https://YOUR_USERNAME.github.io/ai-job-assistant`

## How It Works

```
User input (Job posting + CV)
        ↓
Claude API (claude-sonnet-4-20250514)
        ↓
JSON response:
  - score (0–100)
  - matched requirements
  - missing requirements
  - advice
  - cover letter
  - pre-submission tips
        ↓
Rendered in browser with typing animation
```

## Project Structure

```
ai-job-assistant/
├── index.html      # App shell and layout
├── style.css       # All styles
├── app.js          # Logic, API calls, UI rendering
└── README.md       # This file
```

## Privacy

- Your API key is **never stored** — it's only held in memory during the session
- Your CV and job posting are **never sent anywhere** except directly to Anthropic's API
- There is no analytics, no cookies, no server

## Author

Built by **Szymon Kloskowski** as a portfolio project demonstrating:
- LLM API integration (Anthropic Claude)
- Prompt engineering for structured JSON output
- Client-side web development (HTML, CSS, Vanilla JS)
- Practical AI application design

**Contact:** kloskowskiszymon@wp.pl  
**LinkedIn:** [linkedin.com/in/szymon-kloskowski](https://linkedin.com/in/szymon-kloskowski)

## License

MIT — free to use, fork, and modify.
