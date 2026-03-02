const $ = (id) => document.getElementById(id);

const emailEl = $('email');
const passwordEl = $('password');
const nameEl = $('name');
const terminal = $('terminal');

function log(message, status = 'info') {
  const div = document.createElement('div');
  div.innerHTML = `<span data-status="${status}">[${new Date().toLocaleTimeString()}] ${message}</span>`;
  terminal.appendChild(div);
  terminal.scrollTop = terminal.scrollHeight;
}

function stringify(obj) {
  return JSON.stringify(obj, null, 2);
}

// 1. Sign Up
$('btn-signup').addEventListener('click', async () => {
  log('-- 회원가입 요청 시작 --', 'info');
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailEl.value,
        password: passwordEl.value,
        name: nameEl.value,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      log(`성공: ${res.status}\n${stringify(data)}`, 'success');
    } else {
      log(`실패: ${res.status}\n${stringify(data)}`, 'error');
    }
  } catch (error) {
    log(`에러: ${error.message}`, 'error');
  }
});

// 2. Login
$('btn-login').addEventListener('click', async () => {
  log('-- 로그인 요청 시작 --', 'info');
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailEl.value,
        password: passwordEl.value,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      log(`성공: ${res.status}\n${stringify(data)}`, 'success');
    } else {
      log(`실패: ${res.status}\n${stringify(data)}`, 'error');
    }
  } catch (error) {
    log(`에러: ${error.message}`, 'error');
  }
});

// 3. Get All Users
$('btn-get-users').addEventListener('click', async () => {
  log('-- 전체 유저 조회 --', 'info');
  try {
    const res = await fetch('/api/users');
    const data = await res.json();
    log(
      `응답: ${res.status}\n${stringify(data)}`,
      res.ok ? 'success' : 'error',
    );
  } catch (error) {
    log(`에러: ${error.message}`, 'error');
  }
});

// 4. Ping
$('btn-ping').addEventListener('click', async () => {
  log('-- 서버 Ping --', 'info');
  try {
    const res = await fetch('/api/ping');
    const text = await res.text();
    log(`응답: ${res.status}\n${text}`, res.ok ? 'success' : 'error');
  } catch (error) {
    log(`에러: ${error.message}`, 'error');
  }
});

$('btn-clear').addEventListener('click', () => {
  terminal.innerHTML = '';
});

log('🚀 E2E 테스터 준비 완료!');
