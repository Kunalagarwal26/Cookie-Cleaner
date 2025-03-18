chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoClean') {
    chrome.cookies.getAll({}, (cookies) => {
      cookies.forEach(cookie => {
        if (!isWhitelisted(cookie.domain)) {
          chrome.cookies.remove({ url: `http${cookie.secure ? 's' : ''}://${cookie.domain}`, name: cookie.name });
        }
      });
    });
  }
});

// Helper: Check whitelist from storage
async function isWhitelisted(domain) {
  const data = await chrome.storage.sync.get('whitelist');
  return data.whitelist?.some(pattern => new RegExp(pattern).test(domain));
}