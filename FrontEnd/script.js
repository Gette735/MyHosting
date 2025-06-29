// Get upload button by ID
const uploadBtn = document.getElementById('uploadBtn');

// Create modal container
const modal = document.createElement('div');
modal.style.cssText = `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(145deg, #dcdcdc, #c0c0c0);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 1000;
  display: none;
  border: 3px solid rgba(0,0,0,0.1);
  text-align: center;
`;

// Modal content
modal.innerHTML = `
  <p style="margin-bottom: 15px; font-size: 18px;">>Choose an image (jpg/jpeg only)</p>
  <button id="fileSelectBtn" class="styled"
          style="margin: 0 auto; display: block; margin-bottom: 15px;">
     Select File
  </button>
  <div id="statusMessage" style="color: #2e8b57; font-weight: bold;"></div>
`;

// Create hidden file input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.style.display = 'none';
fileInput.accept = 'image/jpeg, image/jpg'; // JPEG/JPG Only

// Add elements to DOM
document.body.appendChild(modal);
document.body.appendChild(fileInput);

// Show modal on upload button click
uploadBtn.addEventListener('click', () => {
  modal.style.display = 'block';
  document.getElementById('statusMessage').textContent = '';
});

// Trigger file input on modal button click
document.getElementById('fileSelectBtn').addEventListener('click', () => {
  fileInput.click();
});


// Handle file selection
fileInput.addEventListener('change', async (e) => {
  if (e.target.files.length === 0) return;

  const file = e.target.files[0];
  modal.style.display = 'none';

  // Validate file type
  if (!file.type.match('image/jpeg')) {
    alert('Error: Only JPG/JPEG images allowed!');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = 'Uploading...';
    statusMessage.style.color = '#2e8b57';

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      statusMessage.textContent = `File "${result.filename}" uploaded successfully!`;
      statusMessage.style.color = '#2e8b57';


      showSuccessPopup(`/uploads/${result.filename}`, result.original_name);
      loadFiles();
    } else {
      statusMessage.textContent = `Error: ${result.detail || 'Unknown error'}`;
      statusMessage.style.color = '#ff4500';
    }
  } catch (error) {
    document.getElementById('statusMessage').textContent = `Network error: ${error.message}`;
    document.getElementById('statusMessage').style.color = '#ff4500';
    console.error('Upload error:', error);
  }
});

// Show success popup with file link
function showSuccessPopup(fileUrl, fileName) {
  // Remove existing popups
  const existingPopups = document.querySelectorAll('.success-popup');
  existingPopups.forEach(popup => popup.remove());

  // Create popup container
  const popup = document.createElement('div');
  popup.className = 'success-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(145deg, #e6e6e6, #d1d1d1);
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    z-index: 2000;
    border: 4px solid rgba(0,0,0,0.15);
    text-align: center;
    width: 80%;
    max-width: 500px;
  `;

   // Popup content
  popup.innerHTML = `
    <h3 style="margin-bottom: 15px; color: #2e8b57;">✅ File uploaded successfully!</h3>
    <p style="margin-bottom: 10px;">> File URL:</p>
    <div style="
        background: #f8f8f8;
        padding: 10px;
        border-radius: 5px;
        margin: 15px 0;
        border: 1px solid #ddd;
        word-break: break-all;
        font-size: 14px;
    ">
        <a href="${fileUrl}" target="_blank" style="color: #2563eb; text-decoration: none;">
            ${fileName}
        </a>
    </div>
    <button id="copyLinkBtn" class="styled"
            style="margin: 10px; padding: 10px 20px; background: #3b82f6; color: white;">
        Copy URL
    </button>
    <button id="closePopupBtn" class="styled"
            style="margin: 10px; padding: 10px 20px; background: #6b7280; color: white;">
        Close
    </button>
  `;

  // Add elements to DOM
  document.body.appendChild(popup);

  // Copy link handler
  document.getElementById('copyLinkBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(fileUrl)
      .then(() => {
        const btn = document.getElementById('copyLinkBtn');
        btn.textContent = 'Copied!';
        btn.style.background = '#10b981';
        setTimeout(() => {
          if (btn) {
            btn.textContent = 'Copy URL';
            btn.style.background = '#3b82f6';
          }
        }, 2000);
      })
      .catch(err => {
        console.error('Copy failed:', err);
        alert('Failed to copy URL');
      });
  });

  // Close popup handlers
  document.getElementById('closePopupBtn').addEventListener('click', () => {
    popup.remove();
  });

  popup.addEventListener('click', (e) => {
    if (e.target !== popup) {
      popup.remove();
    }
  });
}

function formatFileSize(bytes) {
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;

    if (bytes < KB) {
        return bytes + ' bytes';
    } else if (bytes < MB) {
        return (bytes / KB).toFixed(1) + ' KB';
    } else if (bytes < GB) {
        return (bytes / MB).toFixed(1) + ' MB';
    } else {
        return (bytes / GB).toFixed(1) + ' GB';
    }
}
function displayFiles(files) {
    const container = document.getElementById('filesContainer');
    container.innerHTML = '';

    if (files.length === 0) {
        container.innerHTML = '<p>No files uploaded yet</p>';
        return;
    }

    files.forEach(file => {
        const fileElement = document.createElement('div');
        fileElement.className = 'file-item';

        fileElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <div class="file-name">
                        <a href="${file.url}" target="_blank">${file.name}</a>
                    </div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
                <div class="file-actions">
                    <button class="file-action-btn view-btn" data-url="${file.url}">View</button>
                    <button class="file-action-btn copy-btn" data-url="${file.url}">Copy</button>
                    <button class="file-action-btn delete-btn" data-filename="${file.name}">Delete</button>
                </div>
            </div>
        `;

        container.appendChild(fileElement);
    });


    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const url = btn.getAttribute('data-url');
            window.open(url, '_blank');
        });
    });

    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const url = btn.getAttribute('data-url');
            const fullUrl = window.location.origin + url;

            try {
                await navigator.clipboard.writeText(fullUrl);
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = originalText, 2000);
            } catch (err) {
                console.error('Copy failed:', err);
                alert('Please copy manually: ' + fullUrl);
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const filename = btn.getAttribute('data-filename');

            if (confirm(`Delete ${filename}?`)) {
                try {
                    const response = await fetch(`/files/${filename}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        loadFiles();
                    } else {
                        const error = await response.json();
                        alert(`Error: ${error.detail || 'Delete failed'}`);
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert('Network error');
                }
            }
        });
    });
}
async function loadFiles() {
    try {
        const response = await fetch('/files');
        if (!response.ok) throw new Error('Server error');
        const data = await response.json();
        displayFiles(data.files);
    } catch (error) {
        console.error('File load error:', error);
        document.getElementById('filesContainer').innerHTML = `
            <p class="error">Error: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', loadFiles);