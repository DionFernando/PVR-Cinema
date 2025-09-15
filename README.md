# 🎬 PVR Cinemas — Mobile Ticket Booking (Expo + Firebase)

A sleek React Native (Expo) app for browsing movies, booking seats, and validating tickets with QR codes.  
Includes **User** and **Admin** flows.

> Built with **Expo SDK 54**, **expo-router**, **Firebase Auth + Firestore**, and **expo-barcode-scanner**.

---

## ✨ Features

### User
- Email/password **authentication**
- **Dashboard** with search, “Showing Now” & “Coming Soon”
- **Movie details** with runtime & description
- **Date/Time selection** (shows only **Today / Tomorrow / Day-after**)
- **Seat grid** (80 seats, A–H, categories: Classic / Prime / Superior)
- **Checkout** summary and instant **booking**
- **Tickets** screen:
  - **Upcoming** (with QR for entry)
  - **Past** (no QR)
  - Full-screen QR viewer for easy scanning

### Admin
- **Movies CRUD**
- **Showtimes CRUD**
  - Filter by movie or view all
  - Past times hidden from users automatically
- **QR Scan & Redeem**
  - Scan ticket QR (web or mobile)
  - View details, **Mark as Redeemed**, open printable **Receipt**
- Guarded routes (non-admins are redirected)

---

## 🧰 Tech Stack

- **React Native** (Expo SDK 54)
- **expo-router** (file-based routing)
- **Firebase** (Auth + Firestore)
- **TypeScript**
- **expo-barcode-scanner** (camera QR scanning)

---

## 🚀 Getting Started

### 1) Prerequisites
- **Node.js** (LTS recommended)
- **Expo Go** app on your phone (SDK 54)
- **Firebase** project

### 2) Clone & install
```bash
git clone https://github.com/DionFernando/PVR-Cinema.git
cd PVR-Cinema
npm install


