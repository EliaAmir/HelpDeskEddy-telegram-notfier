# helpdesk-telegram-notifier

A Chrome extension that monitors a HelpDeskEddy support dashboard for unanswered tickets and delivers real-time alerts via **Telegram Bot API** and **EmailJS** — built to solve a real operational problem: missing urgent support tickets while working across multiple browser tabs.

---

## The Problem

HelpDeskEddy has no native push notification system. Unanswered tickets accumulate silently in the sidebar counter — easy to miss during a busy shift or when the dashboard tab is out of focus.

This extension watches that counter continuously and fires an alert the moment a new unanswered ticket appears.

---

## How It Works

The extension runs a content script on the HelpDeskEddy dashboard that:

1. **Polls the DOM** for the "Not Answered" sidebar counter every 2 seconds on boot, then watches for changes
2. **Compares** the current count against the last known count stored in `chrome.storage.local`
3. **Fires dual alerts** when the count increases — a Telegram message and an email — with a 55-second cooldown to prevent spam
4. **Persists state** across page refreshes using Chrome's local storage API

---

## Integrations

| Service | Method | Purpose |
|---|---|---|
| Telegram Bot API | `POST /sendMessage` | Instant phone notification with dashboard deep link |
| EmailJS | REST API | Email fallback alert with ticket count |
| Chrome Storage API | `chrome.storage.local` | State persistence across sessions |

---

## Alert Format

**First ticket appears:**
```
🚨 Not Answered Alert!

There are 3 unanswered tickets on HelpDeskEddy.

👉 Open dashboard
```

**Count increases:**
```
⬆️ Not Answered increased!

Count went from 2 → 5

👉 Open dashboard
```

---

## Setup

### 1. Create a Telegram Bot

1. Open Telegram → search `@BotFather`
2. Send `/newbot` and follow the prompts
3. Copy the bot token you receive
4. Get your chat ID from `@userinfobot`

### 2. Set Up EmailJS (optional)

1. Create a free account at [emailjs.com](https://www.emailjs.com)
2. Create a service and an email template
3. Copy your Service ID, Template ID, and Public Key

### 3. Configure the Extension

Open `content.js` and replace the placeholder values at the top:

```javascript
var TELEGRAM_BOT_TOKEN  = 'YOUR_BOT_TOKEN_HERE';
var TELEGRAM_CHAT_ID    = 'YOUR_CHAT_ID_HERE';
var EMAILJS_SERVICE_ID  = 'YOUR_EMAILJS_SERVICE_ID';
var EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';
var EMAILJS_PUBLIC_KEY  = 'YOUR_EMAILJS_PUBLIC_KEY';
```

### 4. Load in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this project folder

### 5. Open HelpDeskEddy

Navigate to your HelpDeskEddy dashboard. The extension activates automatically on that domain and begins monitoring.

---

## Project Structure

```
helpdesk-telegram-notifier/
├── manifest.json       # Extension config, permissions, host rules
├── content.js          # Core monitoring + alert logic
├── popup.html          # Extension popup UI
├── popup.js            # Popup status checks
└── icon.png            # Extension icon
```

---

## Key Implementation Details

**DOM selector:** The extension targets `a[title="Not answered"][href*="filter/id/3"] .ticket-sidebar__filter-count` — specific enough to survive minor layout changes.

**Cooldown logic:** A 55-second cooldown between alerts prevents notification spam when the counter fluctuates rapidly. The last-sent timestamp is stored in `chrome.storage.local` so the cooldown survives page refreshes.

**Dual notification:** Telegram and EmailJS fire simultaneously. EmailJS serves as a fallback channel if Telegram is unavailable.

---

## Why This Exists

Built to solve a real problem during L1 support work at a hospitality SaaS company: support engineers were missing unanswered ticket spikes because HelpDeskEddy provides no native alerting. This extension closed that gap with two API calls and a content script.

**Result:** 99% SLA compliance maintained after deployment — unanswered tickets were caught and actioned within minutes rather than discovered late.
