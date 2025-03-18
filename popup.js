let whitelist = [];
let deletedCookies = [];

// Load whitelist from storage
chrome.storage.local.get('whitelist', (data) => {
  whitelist = data.whitelist || [];
  renderWhitelist();
});

// Toggle whitelist panel
document.getElementById('toggle-whitelist').addEventListener('click', () => {
  const panel = document.getElementById('whitelist-panel');
  panel.classList.toggle('hidden');
});

// Add to whitelist
document.getElementById('add-whitelist').addEventListener('click', () => {
  const website = document.getElementById('whitelist-input').value
    .trim()
    .toLowerCase()
    .replace(/(^\w+:|^)\/\//, '')
    .replace(/\s+/g, '')
    .replace(/\/$/, '');

  if (website && !whitelist.includes(website)) {
    whitelist.push(website);
    chrome.storage.local.set({ whitelist });
    renderWhitelist();
    document.getElementById('whitelist-input').value = '';
  }
});

// Delete from whitelist
function deleteWebsite(website) {
  whitelist = whitelist.filter(item => item !== website);
  chrome.storage.local.set({ whitelist });
  renderWhitelist();
}

// Render whitelist with delete icon
function renderWhitelist() {
  const list = document.getElementById('whitelist');
  list.innerHTML = '';

  whitelist.forEach(website => {
    const li = document.createElement('li');
    li.className = 'whitelist-item';
    li.innerHTML = `
      <span>${website}</span>
      <button class="delete-btn" data-website="${website}">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    list.appendChild(li);
  });

  // Add delete listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      deleteWebsite(e.target.closest('button').dataset.website);
    });
  });
}

// Clear cookies
document.getElementById('clear-all').addEventListener('click', async () => {
  const confirmed = confirm('Clear all cookies except whitelisted sites?');
  if (!confirmed) return;

  const cookies = await chrome.cookies.getAll({});
  let deletedCount = 0;

  for (const cookie of cookies) {
    const shouldDelete = !whitelist.some(website => 
      cookie.domain.includes(website) || 
      website.includes(cookie.domain)
    );

    if (shouldDelete) {
      await chrome.cookies.remove({
        url: `http${cookie.secure ? 's' : ''}://${cookie.domain}${cookie.path}`,
        name: cookie.name
      });
      deletedCount++;
    }
  }

  document.getElementById('counter').textContent = `Cookies Deleted: ${deletedCount}`;
});
