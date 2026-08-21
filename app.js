const API = 'https://mg-sa-backend.onrender.com';

function getToken() {
  return sessionStorage.getItem('adminToken');
}

function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem('adminUser'));
  } catch {
    return null;
  }
}

function logout() {
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
  sessionStorage.removeItem('pendingLoginEmail');
  window.location.href = 'index.html';
}

async function checkAuth() {
  const user = getUser();
  const token = getToken();
  if (!user || !token || user.role !== 'admin') {
    window.location.href = 'index.html';
    return false;
  }

  // Validate token server-side
  try {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      logout();
      return false;
    }
    const data = await res.json();
    if (!data.user || data.user.role !== 'admin') {
      logout();
      return false;
    }
  } catch {
    logout();
    return false;
  }

  document.getElementById('userName').textContent = user.username;
  document.getElementById('userAvatar').textContent = user.username[0].toUpperCase();
  return true;
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const res = await fetch(`${API}${endpoint}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    logout();
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// Sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('sidebarToggle');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  if (toggle) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      const icon = toggle.querySelector('i');
      if (sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
      } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
      }
    });
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
});
