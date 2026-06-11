// ─── Background Service Worker ────────────────────────────────────────────────
// Receives NOT_ANSWERED_ALERT from content.js and calls the Telegram Bot API.

// ══════════════════════════════════════════════════════════════════════════════
//  🔧  REPLACE THESE TWO VALUES WITH YOUR OWN
// ══════════════════════════════════════════════════════════════════════════════
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';   // from @BotFather
const TELEGRAM_CHAT_ID   = 'YOUR_CHAT_ID_HERE';      // from @userinfobot
// ══════════════════════════════════════════════════════════════════════════════

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Cooldown: don't spam Telegram if badges flicker. Min 60 s between messages.
let lastSentAt = 0;
const COOLDOWN_MS = 60_000;

chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg.type !== 'NOT_ANSWERED_ALERT') return;

  const now = Date.now();
  if (now - lastSentAt < COOLDOWN_MS) {
    console.log('[NotAnsweredAlert] Cooldown active, skipping Telegram message.');
    return;
  }
  lastSentAt = now;

  const text =
    msg.prev === 0
      ? `🚨 *Not Answered* alert!\n\nYou have *${msg.count}* unanswered ticket(s) in HelpDeskEddy.\n\n👉 https://avtobots.helpdeskeddy.com/en/ticket/list/filter/id/3/page/1`
      : `⬆️ *Not Answered* increased!\n\nCount went from *${msg.prev}* → *${msg.count}*\n\n👉 https://avtobots.helpdeskeddy.com/en/ticket/list/filter/id/3/page/1`;

  fetch(TELEGRAM_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    })
  })
    .then(r => r.json())
    .then(data => {
      if (data.ok) {
        console.log('[NotAnsweredAlert] Telegram message sent ✅');
      } else {
        console.error('[NotAnsweredAlert] Telegram error:', data);
      }
    })
    .catch(err => console.error('[NotAnsweredAlert] Fetch error:', err));
});
