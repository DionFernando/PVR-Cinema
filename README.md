# 🎬 PVR Cinemas — Mobile Ticket Booking (Expo + Firebase)

A polished React Native (Expo) app for browsing movies, booking seats, and validating tickets with QR codes. Includes **User** and **Admin** flows.

**Submission Links**

* 🔗 GitHub (public): [https://github.com/your-username/PVR-Cinema](https://github.com/your-username/PVR-Cinema)
* ▶️ YouTube demo: [https://youtu.be/your-demo-link](https://youtu.be/your-demo-link)
* ⬇️ APK / build (Drive or GitHub Releases): [https://your-cloud-link-or-release](https://your-cloud-link-or-release)

---

## ✨ Highlights

**User**

* Email/password auth
* Dashboard with **Search**, **Showing Now**, **Coming Soon**
* Movie details (poster, runtime, description)
* Date & Time select: shows **Today / Tomorrow / Day-after** (hides past times)
* 80-seat grid (A–H) with categories: **Classic / Prime / Superior**
* Seat pick within one category (selected seats **yellow**)
* Checkout summary → booking
* Tickets screen:

  * **Upcoming** (with **QR**)
  * **Past** (no QR)
  * Full-screen QR viewer for easy scanning

**Admin**

* Movies: **Create / Edit / Delete** (future dates → Coming Soon)
* Showtimes: generate **7-day** schedule; users still only see 3 days

  * Filter by **All** or **Movie**
  * Past times never shown to users
* QR Scan: live camera (web or mobile), booking details, **Mark as Redeemed**, printable **Receipt**
* Guarded routes (non-admin → user dashboard)

**Tech**

* Expo SDK 54, expo-router, Firebase (Auth + Firestore), TypeScript, expo-barcode-scanner

---

## 📂 Structure (high level)

```
app/
  (auth)/login.tsx, register.tsx
  (user)/_layout.tsx, dashboard.tsx, tickets.tsx, checkout.tsx
         movie/[movieId]/index.tsx, select.tsx, seats.tsx
  (admin)/_layout.tsx
          movies/index.tsx, new.tsx, [movieId]/edit.tsx
          showtimes/index.tsx, new.tsx, [showtimeId]/edit.tsx
          scan/index.tsx, receipt/[bookingId].tsx
  index.tsx
  welcome.tsx
components/SeatGrid.tsx, AdminHeader.tsx
lib/firebase.ts, movieService.ts, showtimeService.ts, bookingService.ts,
    seatConfig.ts, theme.ts, types.ts, constants.ts, images.ts, url.ts
store/AuthProvider.tsx
assets/images/adaptive-icon.png
```

---

## 🛠 Prerequisites

* Node.js (LTS)
* **Expo Go** on your phone (**SDK 54**)
* A Firebase project (web app)

---

## 🚀 Setup & Run

1. **Install**

```bash
npm install
```

2. **Firebase**

* In Firebase Console:

  * Enable **Authentication → Email/Password**
  * Enable **Cloud Firestore**
* Put your web config in `lib/firebase.ts` (apiKey, authDomain, projectId, etc.).
* Collections used:

  * `users` → `{ uid, name, email, role: "user" | "admin" }`
  * `movies` → `{ title, description, posterUrl, releaseDate: Timestamp, durationMins }`
  * `showtimes` → `{ movieId, date: "YYYY-MM-DD", startTime: "HH:mm", priceMap, seatsReserved: [] }`
  * `bookings` → `{ userId, movieId, showtimeId, seats: string[], seatType, total, status, createdAt, redeemedAt }`

> **Make an admin:** After you register a normal account once, set `users/{uid}.role = "admin"` in Firestore.

3. **Run (use tunnel so web camera works)**

```bash
npx expo start --tunnel
```

* Scan QR with **Expo Go** to open the app on your phone.
* Press **w** to open **Web** (great for Admin + QR scanner).

---

## ▶️ Demo Flow (what to show in your video)

1. **Welcome** → Login as **User**
2. **Dashboard**: search, Showing Now & Coming Soon
3. **Movie details** → **Book Now**
4. **Select**: Today/Tomorrow/Day-after → time → seat count
5. **Seat grid**: pick seats (yellow), **Proceed**
6. **Checkout** → confirm → **Tickets** (Upcoming + QR)
7. **Admin (web)**: login → Movies → Showtimes filter → **Scan QR** (camera)
8. Scan user’s QR → details → **Mark as Redeemed**
9. **User**: Tickets refresh → moved to **Past**

---

## 🧪 Sample Data (copyright-safe posters)

Use these as **Poster URL**:

* **F1** — `https://images.pexels.com/photos/209452/pexels-photo-209452.jpeg?w=800&h=1200&fit=crop`
* **How to Train Your Dragon (2025)** — `https://images.pexels.com/photos/9474111/pexels-photo-9474111.jpeg?w=800&h=1200&fit=crop`
* **Oppenheimer (2023)** — `https://upload.wikimedia.org/wikipedia/commons/3/3a/JROppenheimer-LosAlamos.jpg`

---

## 🔒 Firestore Rules (overview)

* Users can read their own profile & bookings.
* Admins can manage movies/showtimes and update bookings (redeem).
* Gate admin writes with `users/{uid}.role == "admin"`.

> Keep your rules in sync with your data model before sharing the APK.

---

## 📦 Build (APK)

> **Option A — EAS Cloud (recommended)**

```bash
npm i -g eas-cli
eas login
eas build -p android --profile preview
```

* Wait for build to finish on Expo. Download the **APK/AAB** link.
* Share the link or upload the file to **GitHub Releases** or **Drive**.

> **Option B — Local build** (needs Android SDK)
> Use EAS local build if you have the environment set up.

---

## 🧩 Troubleshooting

* **Expo Go SDK mismatch**: Update Expo Go to SDK 54 (or upgrade project).
* **Web camera blocked**: Always start with `--tunnel` (HTTPS), then allow camera permission.
* **Auth persistence warning**: Safe to ignore (sessions won’t persist across app restarts).
* **Nesting list warning**: Avoid FlatList inside same-direction ScrollView (already refactored in main screens).

---

## ✅ Submission Checklist

* [ ] Public GitHub repo link (with this README)
* [ ] Meaningful **git commits** throughout the project
* [ ] Working **APK/build** link (Drive or GitHub Releases)
* [ ] **YouTube** demo link
* [ ] Final submission = **GitHub + YouTube + APK** before deadline

* GitHub: [https://github.com/your-username/PVR-Cinema](https://github.com/your-username/PVR-Cinema)
* YouTube: [https://youtu.be/your-demo-link](https://youtu.be/your-demo-link)
* APK/Build: [https://your-cloud-link-or-release](https://your-cloud-link-or-release)

---

## 🙌 Credits & License

Built with **Expo**, **Firebase**, and **TypeScript**.
Poster images used for demo are **royalty-free/public domain** stand-ins.

**License:** MIT

**Contact / Social:**

* YouTube: [https://youtube.com/@your-channel](https://youtube.com/@your-channel)
* LinkedIn: [https://www.linkedin.com/in/your-handle/](https://www.linkedin.com/in/your-handle/)
