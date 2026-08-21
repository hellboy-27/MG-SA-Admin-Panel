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
  console.log('[DEBUG APP] logout() called');
  sessionStorage.removeItem('adminToken');
  sessionStorage.removeItem('adminUser');
  sessionStorage.removeItem('pendingLoginEmail');
  window.location.href = 'index.html';
}

async function checkAuth() {
  console.log('[DEBUG APP] checkAuth() START');
  const user = getUser();
  const token = getToken();
  console.log('[DEBUG APP] sessionStorage:', { 
    adminToken: !!token,
    adminUser: !!user,
    userRole: user?.role
  });

  if (!user || !token || user.role !== 'admin') {
    console.log('[DEBUG APP] checkAuth FAIL - missing token/user/role');
    window.location.href = 'index.html';
    return false;
  }

  // Validate token server-side
  try {
    console.log('[DEBUG APP] Calling /api/auth/me to validate token...');
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('[DEBUG APP] /api/auth/me response:', res.status, res.statusText);
    if (!res.ok) {
      console.log('[DEBUG APP] Token validation FAILED - logging out');
      logout();
      return false;
    }
    const data = await res.json();
    console.log('[DEBUG APP] /api/auth/me data:', data);
    if (!data.user || data.user.role !== 'admin') {
      console.log('[DEBUG APP] User not admin - logging out');
      logout();
      return false;
    }
    console.log('[DEBUG APP] checkAuth SUCCESS - token valid');
  } catch (err) {
    console.error('[DEBUG APP] checkAuth ERROR:', err);
    logout();
    return false;
  }

  document.getElementById('userName').textContent = user.username;
  document.getElementById('userAvatar').textContent = user.username[0].toUpperCase();
  return true;
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  console.log('[DEBUG APP] apiRequest:', endpoint, '| token present:', !!token);
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  const res = await fetch(`${API}${endpoint}`, { ...options, headers });
  console.log('[DEBUG APP] apiRequest response:', endpoint, res.status);

  if (res.status === 401 || res.status === 403) {
    console.log('[DEBUG APP] 401/403 - logging out');
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
