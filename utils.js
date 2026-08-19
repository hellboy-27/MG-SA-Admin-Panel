// Toast notifications
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const colors = {
    success: 'var(--accent-teal)',
    error: 'var(--accent-pink)',
    warning: 'var(--accent-yellow)',
    info: 'var(--accent-orange)'
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: var(--bg-card); border: 1px solid ${colors[type]};
    border-radius: 8px; padding: 14px 20px; display: flex; align-items: center;
    gap: 10px; font-size: 0.88rem; color: var(--text-primary);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4); animation: toastIn 0.3s ease;
    max-width: 400px;
  `;
  toast.innerHTML = `<i class="fa-solid ${icons[type]}" style="color:${colors[type]};font-size:1.1rem"></i> <span>${message}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Compress image file
function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let w = img.width;
      let h = img.height;

      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob((blob) => {
        if (blob && blob.size < file.size) {
          const compressed = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
          resolve(compressed);
        } else {
          resolve(file);
        }
      }, 'image/jpeg', quality);
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

// Loading overlay
function showLoading(msg = 'Procesando...') {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(6,5,9,0.75);
      backdrop-filter: blur(4px); display: flex; align-items: center;
      justify-content: center; z-index: 10000;
    `;
    overlay.innerHTML = `<div style="text-align:center;color:var(--text-primary)">
      <div class="spinner" style="width:36px;height:36px;border:3px solid var(--border-color);border-top-color:var(--accent-orange);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px"></div>
      <span style="font-size:0.9rem">${msg}</span>
    </div>`;

    const style = document.createElement('style');
    style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}@keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes toastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(20px)}}';
    document.head.appendChild(style);
    document.body.appendChild(overlay);
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.remove();
}

// Confirm dialog
function showConfirm(msg) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; background: rgba(6,5,9,0.8);
      backdrop-filter: blur(4px); display: flex; align-items: center;
      justify-content: center; z-index: 10001;
    `;
    overlay.innerHTML = `
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:28px;max-width:380px;width:90%;text-align:center;box-shadow:var(--shadow)">
        <i class="fa-solid fa-circle-question" style="font-size:2rem;color:var(--accent-yellow);margin-bottom:12px"></i>
        <p style="font-size:0.92rem;color:var(--text-primary);margin-bottom:20px">${msg}</p>
        <div style="display:flex;gap:8px;justify-content:center">
          <button id="confirmYes" style="padding:8px 20px;border:none;border-radius:6px;background:linear-gradient(135deg,var(--accent-orange),var(--accent-pink));color:#fff;font-weight:600;cursor:pointer;font-size:0.85rem">Si</button>
          <button id="confirmNo" style="padding:8px 20px;border:1px solid var(--border-color);border-radius:6px;background:transparent;color:var(--text-secondary);cursor:pointer;font-size:0.85rem">No</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#confirmYes').onclick = () => { overlay.remove(); resolve(true); };
    overlay.querySelector('#confirmNo').onclick = () => { overlay.remove(); resolve(false); };
  });
}
