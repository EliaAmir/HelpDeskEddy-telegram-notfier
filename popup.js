// Check if the user has configured their token
fetch('background.js')
  .then(r => r.text())
  .then(src => {
    const hasToken = !src.includes('YOUR_BOT_TOKEN_HERE');
    const hasChatId = !src.includes('YOUR_CHAT_ID_HERE');

    document.getElementById('token-status').textContent =
      hasToken && hasChatId ? '✅ Configured' : '❌ Not set';
    document.getElementById('token-status').className =
      'value' + (hasToken && hasChatId ? '' : ' warn');

    if (!hasToken || !hasChatId) {
      document.getElementById('config-note').style.display = 'block';
    }
  });

// Check if we're on the right tab
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const url = tabs[0]?.url ?? '';
  const onPage = url.includes('avtobots.helpdeskeddy.com');
  document.getElementById('page-status').textContent = onPage ? '✅ Yes' : '❌ Open the dashboard';
  document.getElementById('page-status').className = 'value' + (onPage ? '' : ' warn');
  document.getElementById('status').textContent = onPage ? 'Active' : 'Idle';
});
