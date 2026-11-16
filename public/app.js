const requestEl = document.getElementById('request');
const statusEl = document.getElementById('status');
const bodyEl = document.getElementById('body');

function show(request, status, body, isOk) {
  requestEl.textContent = request;
  statusEl.textContent = status;
  statusEl.className = isOk ? 'ok' : 'error';
  bodyEl.textContent = body;
}

async function callApi(method, path) {
  const label = `${method} ${path}`;
  try {
    const response = await fetch(path, { method });
    const text = await response.text();

    // Pretty-print JSON with 2-space indentation; fall back to raw text.
    let formatted = text;
    try {
      formatted = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      // not JSON, keep the raw text
    }

    show(label, `${response.status} ${response.statusText}`, formatted, response.ok);
  } catch (err) {
    // Network failure etc. - show it instead of crashing the page.
    show(label, 'Request failed', String(err), false);
  }
}

for (const button of document.querySelectorAll('button[data-path]')) {
  button.addEventListener('click', () => {
    callApi(button.dataset.method ?? 'GET', button.dataset.path);
  });
}
