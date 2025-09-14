// dashboard.js — displays role-aware dashboard
const profileEl = document.getElementById('profile');
const titleEl = document.getElementById('page-title');
const subEl = document.getElementById('sub');
const noteEl = document.getElementById('note');

async function loadProfile() {
  profileEl.textContent = 'Loading profile…';
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('not authorized');
    const j = await res.json();

    profileEl.innerHTML = `<strong>${j.profile.name}</strong>`;
    const role = j.role || 'user';

    if (role === 'admin') {
      titleEl.textContent = 'Admin Dashboard';
      subEl.textContent = 'Administrative access';
      noteEl.textContent = 'Admin access detected. (Server console contains base64-encoded flag.)';
    } else {
      titleEl.textContent = 'Student Dashboard';
      subEl.textContent = 'Personal area';
      noteEl.textContent = 'Welcome to your dashboard.';
    }
  } catch (e) {
    profileEl.textContent = 'Unable to load profile';
  }
}

document.getElementById('who').addEventListener('click', async () => {
  try {
    const r = await fetch('/_whoami');
    const j = await r.json();
    noteEl.textContent = JSON.stringify(j, null, 2);
  } catch (e) {
    noteEl.textContent = 'Error retrieving session';
  }
});

document.getElementById('logout').addEventListener('click', async () => {
  await fetch('/logout', { method: 'POST', credentials: 'include' });
  window.location = '/';
});

loadProfile();
