document.addEventListener('DOMContentLoaded', () => {
    // Load saved settings
    chrome.storage.sync.get(['accountId'], (result) => {
      if (result.accountId) {
        document.getElementById('accountId').value = result.accountId;
      }
    });
  
    // Save settings
    document.getElementById('save').addEventListener('click', () => {
      const accountId = document.getElementById('accountId').value;
      chrome.storage.sync.set({ accountId }, () => {
        const status = document.getElementById('status');
        status.style.display = 'block';
        setTimeout(() => {
          status.style.display = 'none';
        }, 2000);
      });
    });
  });
  