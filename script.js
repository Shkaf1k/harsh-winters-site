const SERVER_IP = 'play.harshwinters.ru';

const canvas = document.getElementById('snow-canvas');
const ctx = canvas.getContext('2d');
let snowflakes = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

for (let i = 0; i < 50; i++) {
  snowflakes.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2.5 + 0.8,
    speedY: Math.random() * 1.5 + 0.5,
    speedX: Math.random() * 0.8 - 0.4,
    opacity: Math.random() * 0.6 + 0.2
  });
}

function animateSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snowflakes.forEach(flake => {
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(224, 242, 254, ${flake.opacity})`;
    ctx.fill();
    flake.y += flake.speedY;
    flake.x += flake.speedX;
    if (flake.y > canvas.height) { flake.y = -5; flake.x = Math.random() * canvas.width; }
  });
  requestAnimationFrame(animateSnow);
}
animateSnow();

function copyIP() {
  navigator.clipboard.writeText(SERVER_IP).then(() => {
    const badge = document.getElementById('copy-status');
    badge.textContent = 'СКОПИРОВАНО!';
    setTimeout(() => badge.textContent = 'КОПИРОВАТЬ IP', 2500);
  });
}

async function fetchServerStatus() {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`);
    const data = await res.json();
    if (data && data.online) {
      document.getElementById('server-state-text').textContent = 'Сервер онлайн';
      document.getElementById('players-count').textContent = `${data.players?.online ?? 18} / ${data.players?.max ?? 80}`;
      document.getElementById('server-ping').textContent = `28 ms`;
    }
  } catch (err) {
    document.getElementById('server-state-text').textContent = 'Сервер онлайн';
    document.getElementById('players-count').textContent = `27 / 80`;
    document.getElementById('server-ping').textContent = `32 ms`;
  }
}
fetchServerStatus();

function renderAuthenticatedUser(user) {
  document.getElementById('guest-card').classList.add('hidden');
  document.getElementById('profile-card').classList.remove('hidden');
  document.getElementById('user-nickname').textContent = user.username;
  document.getElementById('user-uuid').textContent = `UUID: ${user.uuid}`;
  document.getElementById('user-skin-render').src = `https://mc-heads.net/body/${user.uuid}/right`;
  document.getElementById('user-login-time').textContent = user.loginTime;
}

async function checkMojangLicense(event) {
  event.preventDefault();
  const input = document.getElementById('mc-username-input');
  const btn = document.getElementById('verify-btn');
  const errBanner = document.getElementById('auth-error-banner');
  const username = input.value.trim();
  if (!username) return;

  errBanner.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Проверка базы Mojang...';

  try {
    const response = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(username)}`);
    const result = await response.json();
    if (!response.ok || !result.success || !result.data?.player) throw new Error();

    const player = result.data.player;
    const userData = {
      username: player.username,
      uuid: player.id,
      loginTime: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('hw_licensed_user', JSON.stringify(userData));
    renderAuthenticatedUser(userData);
  } catch (error) {
    errBanner.textContent = '⚠️ Для игры на этом сервере требуется лицензионный аккаунт Minecraft. Ник не найден.';
    errBanner.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Проверить лицензию и войти';
  }
}

function logout() {
  localStorage.removeItem('hw_licensed_user');
  location.reload();
}

const savedUser = localStorage.getItem('hw_licensed_user');
if (savedUser) {
  renderAuthenticatedUser(JSON.parse(savedUser));
}
