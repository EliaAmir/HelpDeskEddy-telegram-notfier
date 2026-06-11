// ─── HelpDeskEddy Not Answered Alert ─────────────────────────────────────────

var TELEGRAM_BOT_TOKEN = 'TELEGRAM_BOT_TOKEN';
var TELEGRAM_CHAT_ID   = 'USERNAME_CHAT_ID';
var EMAILJS_SERVICE_ID  = 'EMAILJS_SERVICE_ID';
var EMAILJS_TEMPLATE_ID = 'EMAILJS_TEMPLATE_ID';
var EMAILJS_PUBLIC_KEY  = 'EMAILJS_PUBLIC_KEY';
var COOLDOWN_MS         = 55000;
var STORAGE_KEY_COUNT   = 'na_lastCount';
var STORAGE_KEY_SENT    = 'na_lastSentAt';

function sendTelegram(text) {
  fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'Markdown',
      disable_web_page_preview: false
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.ok) {
      console.log('[NotAnsweredAlert] Telegram sent');
    } else {
      console.error('[NotAnsweredAlert] Telegram error:', data);
    }
  })
  .catch(function(err) {
    console.error('[NotAnsweredAlert] Fetch error:', err);
  });
}

function sendEmail(count) {
  fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:  EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id:     EMAILJS_PUBLIC_KEY,
      template_params: {
        count: count
      }
    })
  })
  .then(function(r) {
    console.log('[NotAnsweredAlert] Email sent, status:', r.status);
  })
  .catch(function(err) {
    console.error('[NotAnsweredAlert] Email error:', err);
  });
}

function getNotAnsweredCount() {
  var btn = document.querySelector('a[title="Not answered"][href*="filter/id/3"]');
  if (!btn) return -1;
  var countEl = btn.querySelector('.ticket-sidebar__filter-count');
  if (!countEl) return 0;
  var n = parseInt(countEl.textContent.trim(), 10);
  return isNaN(n) ? 0 : n;
}

function checkAndAlert() {
  var count = getNotAnsweredCount();

  if (count < 0) {
    console.log('[NotAnsweredAlert] Element not found, retrying in 2s');
    setTimeout(checkAndAlert, 2000);
    return;
  }

  chrome.storage.local.get([STORAGE_KEY_COUNT, STORAGE_KEY_SENT], function(result) {
    var lastCount  = parseInt(result[STORAGE_KEY_COUNT] || '0', 10);
    var lastSentAt = parseInt(result[STORAGE_KEY_SENT]  || '0', 10);
    var now        = Date.now();

    console.log('[NotAnsweredAlert] Not answered: ' + count + ' (was ' + lastCount + ')');

    if (count > 0 && count > lastCount && (now - lastSentAt) > COOLDOWN_MS) {
      var msg = lastCount === 0
        ? '🚨 *Not Answered Alert!*\n\nThere ' + (count === 1 ? 'is' : 'are') + ' *' + count + '* unanswered ticket' + (count === 1 ? '' : 's') + ' on HelpDeskEddy.\n\n👉 [Open dashboard](https://avtobots.helpdeskeddy.com/en/ticket/list/filter/id/3/page/1)'
        : '⬆️ *Not Answered increased!*\n\nCount went from *' + lastCount + '* to *' + count + '*\n\n👉 [Open dashboard](https://avtobots.helpdeskeddy.com/en/ticket/list/filter/id/3/page/1)';

      sendTelegram(msg);
      sendEmail(count); // ← fires at the same time as Telegram

      var update = {};
      update[STORAGE_KEY_SENT] = String(now);
      chrome.storage.local.set(update);
    }

    var save = {};
    save[STORAGE_KEY_COUNT] = String(count);
    chrome.storage.local.set(save);
  });
}

// Boot - wait for page to fully render then check
setTimeout(checkAndAlert, 2000);