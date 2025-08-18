![gitdiagram ](https://github.com/subu-4494/interview-prep-platform/blob/main/interview-prep-platform-gitdiagram.png)



# prep4sde – Interview Practice Platform

A full‑stack platform for mock interviews featuring **real‑time collaborative coding**, **live video rooms**, **interview scheduling**, and **secure profiles** using **JWT-based auth**.

> The attached architecture diagram (see `/mnt/data/interview-prep-platform-gitdiagram.png`) illustrates the high‑level flow between the React SPA, Express API, WebSocket server, WebRTC signaling, and MongoDB.

---

## 🚀 Core Features

* 🖥️ **Real‑Time Code Editor** (pair programming): collaborative Monaco-based editor, cursor presence, synced files, interview templates.
* 🎥 **Live Video & Audio**: WebRTC rooms with screen share, mute controls, network resilience.
* 🗓️ **Interview Scheduling**: timezone-aware slot booking, invites, reminders, and reschedule flow.
* 🔐 **Secure Auth**: JWT access + refresh tokens, role-based authorization (candidate, interviewer, admin).
* 📊 **Session Artifacts**: code transcripts, feedback notes, and recordings (optional) saved to storage.
* 🔔 **Notifications**: email + in‑app toasts for booking, reminders, and room open events.
* 📈 **Admin Console**: manage users, slots, and session analytics.

---

## 🧱 Tech Stack

| Layer        | Technology                                                                             |
| ------------ | -------------------------------------------------------------------------------------- |
| Frontend     | React (Vite/CRA), React Router, Zustand/Redux, Tailwind CSS, Monaco Editor             |
| Realtime     | Socket.IO (WS), WebRTC (peer connections), STUN/TURN (eg. Google STUN or managed TURN) |
| Backend      | Node.js, Express.js                                                                    |
| DB           | MongoDB + Mongoose                                                                     |
| Cache/Queues | Redis (rate limits, sessions, sockets presence, jobs)                                  |
| Auth         | JWT (Access + Refresh), Cookies (httpOnly)                                             |
| Mail         | Nodemailer / Resend / SES                                                              |
| Storage      | S3-compatible (for recordings & attachments)                                           |
| Jobs         | node-cron / BullMQ (reminders, cleanup)                                                |
| Testing      | Jest, Supertest                                                                        |

---

## 🗺️ High‑Level Architecture

1. **React SPA** calls **Express API** over HTTPS for auth, scheduling, profiles, and persistence.
2. **Socket.IO** provides real‑time doc ops (code editor), presence, and WebRTC signaling messages.
3. **WebRTC** peers exchange media via STUN/TURN; backend only handles signaling and optional recording orchestration.
4. **MongoDB** stores users, interviews, slots, session artifacts; **Redis** caches presence and rate limits.
5. **Jobs service** sends email reminders, prunes expired rooms, and archives session outcomes.

---

## 📁 Project Structure

```
prep4sde/
├── backend/
│   ├── src/
│   │   ├── app.ts                       # express bootstrap
│   │   ├── config/                      # env, logger
│   │   ├── middleware/                  # auth, rate limit, error
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── users/
│   │   │   ├── scheduling/
│   │   │   │   ├── slot.controller.ts
│   │   │   │   ├── slot.model.ts
│   │   │   │   └── slot.routes.ts
│   │   │   ├── interviews/
│   │   │   │   ├── interview.controller.ts
│   │   │   │   ├── interview.model.ts
│   │   │   │   └── interview.routes.ts
│   │   │   ├── rtc/                      # signaling endpoints
│   │   │   └── editor/                   # code session persistence
│   │   ├── sockets/
│   │   │   ├── index.ts                  # Socket.IO init
│   │   │   ├── editor.gateway.ts         # code ops events
│   │   │   └── rtc.gateway.ts            # webrtc signaling events
│   │   ├── jobs/
│   │   │   ├── queue.ts
│   │   │   └── workers/
│   │   └── utils/
│   ├── tests/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── routes.tsx
    │   │   └── store.ts
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── SchedulePage.tsx
    │   │   ├── InterviewRoom.tsx         # video + editor
    │   │   └── ProfilePage.tsx
    │   ├── components/
    │   │   ├── CodeEditor.tsx            # Monaco wrapper
    │   │   ├── VideoPanel.tsx            # WebRTC UI
    │   │   ├── ChatPanel.tsx
    │   │   └── SlotPicker.tsx
    │   └── utils/
    └── package.json
```

---

## 🔑 Auth & Security

* **JWT Access Token (short TTL)** in `Authorization: Bearer <token>`.
* **Refresh Token (long TTL)** stored as `httpOnly`, `secure`, `sameSite=strict` cookie.
* **CSRF**: non-idempotent routes require CSRF header when cookies used.
* **RBAC**: roles: `candidate`, `interviewer`, `admin`.
* **Rate Limiting**: IP + user sliding window via Redis.
* **Password hashing**: bcrypt with strong params.

### Auth Endpoints

| Method | Endpoint             | Description                 |
| -----: | -------------------- | --------------------------- |
|   POST | `/api/auth/register` | Create user                 |
|   POST | `/api/auth/login`    | Email+pwd -> access+refresh |
|   POST | `/api/auth/refresh`  | Rotate tokens               |
|   POST | `/api/auth/logout`   | Invalidate refresh          |
|    GET | `/api/me`            | Current user profile        |
|  PATCH | `/api/me`            | Update profile fields       |

---

## 📅 Scheduling Module

* **Slots**: interviewer publishes availability.
* **Booking**: candidate books a slot; conflict checked with Mongo transaction.
* **Reminders**: T‑30m email job; calendar attachment (ICS) optional.

### REST Endpoints

| Method | Endpoint                     | Description          |
| -----: | ---------------------------- | -------------------- |
|    GET | `/api/slots`                 | List open slots      |
|   POST | `/api/slots` (interviewer)   | Create/patch slots   |
|   POST | `/api/interviews`            | Book a slot          |
|    GET | `/api/interviews/my`         | My upcoming/past     |
|  PATCH | `/api/interviews/:id/cancel` | Cancel (rules apply) |

---

## 🧑‍💻 Real‑Time Code Sessions

* **Operational transforms** or CRDT-lite (Socket.IO room broadcast with server ordering).
* **Language support**: multi-language syntax via Monaco; optional compile/run service.
* **Artifacts**: final buffer stored to Mongo/S3 at session end.

### Socket.IO Events (namespace: `/editor`)

| Event             | Direction | Payload                  |
| ----------------- | --------- | ------------------------ |
| `editor:join`     | C→S       | { roomId }               |
| `editor:state`    | S→C       | { content, cursors }     |
| `editor:op`       | C↔S       | { ops, version, cursor } |
| `editor:presence` | C↔S       | { userId, cursor }       |
| `editor:leave`    | C→S       | { }                      |
| `editor:save`     | C→S       | { snapshot }             |

---

## 🎥 Video / WebRTC Rooms

* **Signaling over Socket.IO** (namespace: `/rtc`).
* **TURN recommended** for NAT traversal; configure credentials via env.
* Optional **server-side recording** using SFU/service provider (if adopted) or client-side MediaRecorder with consent.

### Signaling Events

| Event           | Direction | Payload           |
| --------------- | --------- | ----------------- |
| `rtc:join`      | C→S       | { roomId }        |
| `rtc:offer`     | C→S       | { sdp, to }       |
| `rtc:answer`    | C→S       | { sdp, to }       |
| `rtc:candidate` | C→S       | { candidate, to } |
| `rtc:leave`     | C→S       | { }               |

---

## 🧪 APIs – Interview Sessions

| Method | Endpoint                      | Description                          |
| -----: | ----------------------------- | ------------------------------------ |
|   POST | `/api/sessions`               | Create session (ties booking → room) |
|    GET | `/api/sessions/:id`           | Session detail + join tokens         |
|   POST | `/api/sessions/:id/notes`     | Save feedback notes                  |
|   POST | `/api/sessions/:id/artifacts` | Upload code/recordings refs          |

---

## ⚙️ Environment (.env)

```ini
# Server
PORT=8080
NODE_ENV=development
CLIENT_ORIGIN=https://localhost:5173

# Mongo & Redis
MONGO_URI=mongodb://localhost:27017/prep4sde
REDIS_URL=redis://localhost:6379

# Auth
JWT_ACCESS_SECRET=replace_me
JWT_ACCESS_TTL=15m
JWT_REFRESH_SECRET=replace_me_too
JWT_REFRESH_TTL=7d

# Mail
MAIL_FROM=no-reply@prep4sde.com
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=

# WebRTC
STUN_URL=stun:stun.l.google.com:19302
TURN_URL=
TURN_USERNAME=
TURN_PASSWORD=

# Storage
S3_ENDPOINT=
S3_BUCKET=prep4sde
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

---

## 🧰 Local Development

```bash
# Backend
cd backend
npm i
npm run dev

# Frontend
cd ../frontend
npm i
npm run dev
```

Open frontend at `http://localhost:5173` (or CRA port) and ensure `CLIENT_ORIGIN` matches.

---

## 🔒 Security & Compliance Checklist

* httpOnly, secure cookies for refresh tokens; rotate on each refresh.
* CORS allowlist by origin + method + headers.
* Helmet, HPP, and strict Content‑Security‑Policy.
* Validate all inputs (zod/joi) + centralized error handler.
* Protect signaling and editor namespaces with JWT handshake.
* Recordings and artifacts stored with time‑scoped signed URLs.
* Audit logs for admin actions.

---

## 🧭 Roadmap / Nice‑to‑Haves

* SFU (mediasoup/janus) for larger rooms and server‑side recording.
* Code execution sandbox (Firecracker / Docker) with resource limits.
* Calendar integrations (Google/Microsoft) for auto‑invites.
* Rich interviewer rubric + scorecards; analytics dashboard.
* Mobile‑friendly PWA + offline draft notes.

---

## 👤 Authors

**Sourabh Roy** – prep4sde

Contributors welcome.

---

## 📄 License

MIT License
