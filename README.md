# Assignment 8 – Study Programme Information Server

A small Node.js + Express 5 server (ES modules) with several routes, a browser page served by the same server, a request logger and a request counter. No database, no extra packages besides `express`.

## How to install and run

```bash
git clone <repository-url>
cd <repository-folder>
npm install        # installs express from package.json / package-lock.json
npm start          # node server.js
npm run dev        # node --watch server.js (auto restart, built into Node)
```

The server prints `Server running at http://localhost:3000`. Use another port with `PORT=4000 npm start`. Open the address in a browser to use the page.

## File organization

```
.
├─ public/
│  ├─ index.html    page: intro text + one button per API route
│  ├─ styles.css    external styles
│  └─ app.js        external script, uses fetch() with relative URLs
├─ server.js        Express app, middleware, routes, 404 fallback
├─ package.json     "type": "module", scripts start/dev, express dependency
├─ package-lock.json
├─ .gitignore       node_modules/, .env
└─ README.md
```

## Middleware: order and counting rules

Both middlewares are in `server.js`, registered **before** the routes and before `express.static`, and both call `next()`.

* **Logger** prints `[timestamp] METHOD URL` for every request. It is first so that every request is logged, even ones that a later handler answers (static files, 404s).
* **Counter** increments `requestsServed` and is exposed at `GET /api/stats`.
* **Which requests are counted:** *all* of them – static files (`/`, `/styles.css`, `/app.js`), API routes, redirects, 404s, and the `/api/stats` request itself (it is counted before it answers, so the first call on a fresh server returns 1 or more). Reason: the counter sits before everything else, so it measures "requests the server has served since it started", which is what the assignment describes. If it were placed after `express.static` or the routes, requests answered earlier would be skipped.

## curl evidence (Section 7)

Run from a different folder than the project (`cd /`) to show the server works from anywhere. Server started with `PORT=3111 node server.js`.

**1. Successful JSON – `curl --include http://localhost:3111/api/courses`**
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 235
ETag: W/"eb-0UMExWqE25YVOG5DkYK+Yzzf3XE"
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Introduction to Web Development","credits":5},{"id":2,"title":"Databases and Data Modelling","credits":6},{"id":3,"title":"Algorithms and Data Structures","credits":6},{"id":4,"title":"Computer Networks","credits":4}]
```

**2. 201 – `curl --include -X POST http://localhost:3111/api/subscribe`**
```
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

**3. 403 – `curl --include http://localhost:3111/api/admin`**
```
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

**4. Redirect – `curl --include http://localhost:3111/old-page`**
```
HTTP/1.1 302 Found
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 28
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Found. Redirecting to /hello
```

**5. 404 on an API path – `curl --include http://localhost:3111/api/nope`**
```
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

**6. 404 on a non-API path – `curl --include http://localhost:3111/nope`**
```
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 42
ETag: W/"2a-3Jgn4ALAw/DhRDQ1iOBNPDMsuBY"
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

<h1>404</h1><p>The page was not found.</p>
```

**7. Plain text – `curl --include http://localhost:3111/robots.txt`**
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 44
ETag: W/"2c-DAwhhjEHmywYRDneHqwJgKFWJzI"
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

User-agent: *
Disallow: /api/admin
Allow: /
```

**8. Real process values – `curl --include http://localhost:3111/api/status`**
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 58
ETag: W/"3a-VrjrEzAht29tPzovzlycEwPWTTs"
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"ok","nodeVersion":"v24.15.0","uptimeSeconds":4}
```

**9. Header echo – `curl --include http://localhost:3111/api/headers`**
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 42
ETag: W/"2a-+StAhZewmG4GOyTshAZgq1UhO4g"
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"user-agent":"curl/8.7.1","accept":"*/*"}
```

**10. Counter – `curl --include http://localhost:3111/api/stats`** (after 9 earlier requests, so this one is the 10th)
```
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-377RHb+fs5m7JgR3meGKOe0hbQc"
Date: Sun, 15 Nov 2026 08:23:38 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"requestsServed":10}
```

## Reasoning questions (Section 8)

1. **Route order.** I moved the 404 fallback above the static middleware and the routes. Every request, including `GET /`, `/hello` and `/api/courses`, then returned `404 Not Found`, even though the routes still exist. Express runs handlers in registration order and the first one that sends a response wins; the fallback matches everything, so the real routes were never reached. That is why the fallback must be registered last.
2. **Middleware.** I removed `next()` from the logger. The server printed the log line for `GET /hello` and nothing else, and the request never got a response: `curl` hung until I stopped it after 3 seconds (the browser would show a spinning tab and finally time out). Without `next()` (and without sending a response) the request chain stops in the logger, so the counter, the routes and the 404 fallback never run.
3. **Status codes.** `POST /api/subscribe` creates something (a subscription), and `201 Created` tells the client precisely that, while `200` only says "OK". A missing page is `404` because the status code is what clients, browsers, caches and search engines read to know the resource does not exist; a `200` with an error text would make them treat the error page as a valid page.
4. **Configuration.** Hosting platforms and other developers choose the port through the environment, and a hard-coded `3000` would crash if that port is already used or the platform assigns a different one. `process.env.PORT || 3000` takes the configured port and falls back to 3000 on a local machine.
5. **Dependencies.** `node_modules` is large, can be regenerated, and may contain platform-specific files, so it is excluded with `.gitignore`. `package.json` and `package-lock.json` record exactly which versions are needed. A teammate clones the repository and runs `npm install`, then `npm start`.
6. **Same origin.** If the page is opened from disk (`file:///.../index.html`), its origin is `file://` and the relative URL `/api/courses` would point to a file path, not to the server (and even with an absolute `http://localhost:3000/...` URL the browser would block reading the response because the origins differ). The restriction is called the **same-origin policy**; cross-origin access is only possible when the server allows it with CORS headers. Serving the page from the same server avoids the issue.

## Self-study notes

* **Node version and uptime.** From the Node `process` documentation: `process.version` returns the Node version string (e.g. `v24.15.0`) and `process.uptime()` returns the number of seconds the process has been running (a float, so I use `Math.round`). Used in `/api/status`.
* **Plain-text content type.** From the Express docs for `res.type()`: `res.type('text/plain').send(...)` sets the `Content-Type` header to `text/plain; charset=utf-8`. Without it, `res.send` of a string would answer `text/html`. Used in `/robots.txt`.
* **Pretty JSON in the browser.** `JSON.stringify(value, null, 2)` formats JSON with 2-space indentation (MDN). In `app.js` I parse the response text and stringify it again into a `<pre>` element; if parsing fails (e.g. the HTML 404 page) the raw text is shown.
* **Other things researched:** `import.meta.dirname` (Node ≥ 20.11) gives the folder of the current ES module, replacing CommonJS `__dirname`; I use it so `express.static` finds `public/` no matter which folder the server is started from. In Express 5, `app.get('*', ...)` is invalid, so the fallback is a path-less `app.use((req, res) => ...)` registered last.

## Challenges I faced

* Replacing `__dirname` (not available in ES modules) with `import.meta.dirname`.
* Understanding that the 404 fallback must be last, and that a missing `next()` silently hangs requests.
* Express 5 no longer accepts the `*` wildcard, so the fallback uses `app.use` without a path.
* Deciding where the counter goes and what it counts; I count everything because it sits before all other handlers.
