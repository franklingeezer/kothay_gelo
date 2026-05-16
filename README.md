# Kothay Gelo? 💸
### Smart Expense Tracker for Bangladesh

A modern, mobile-first PWA expense tracker built with React + Vite. Dark-themed, fast, and installable.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run in development
```bash
npm run dev
```
App runs at `http://localhost:5173`

### 3. Build for production
```bash
npm run build
```

### 4. Preview production build
```bash
npm run preview
```

---

## 📁 Project Structure

```
kothay-gelo/
├── public/
│   ├── manifest.json         # PWA manifest
│   ├── icon-192.png          # App icon (add your own)
│   └── icon-512.png          # App icon (add your own)
├── src/
│   ├── components/
│   │   ├── Home.jsx          # Home dashboard
│   │   ├── Home.module.css
│   │   ├── AddExpense.jsx    # Add expense form
│   │   ├── AddExpense.module.css
│   │   ├── Analytics.jsx     # Charts & breakdown
│   │   ├── Analytics.module.css
│   │   ├── Goals.jsx         # Goal tracking
│   │   ├── Goals.module.css
│   │   ├── NavBar.jsx        # Bottom navigation
│   │   ├── NavBar.module.css
│   │   ├── Toast.jsx         # Notifications
│   │   └── Toast.module.css
│   ├── styles/
│   │   └── global.css        # Design tokens & base styles
│   ├── utils/
│   │   └── constants.js      # Categories, helpers, insights
│   ├── store.js              # Zustand global state (persisted)
│   ├── App.jsx               # Root component
│   ├── App.module.css
│   └── main.jsx              # Entry point
├── index.html
├── vite.config.js            # Vite + PWA config
└── package.json
```

---

## 🌐 Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo at [vercel.com](https://vercel.com).

## 🌐 Deploy to Netlify (Free)

```bash
npm run build
# Drag & drop the /dist folder at netlify.com/drop
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 Daily Budget | Live progress bar with color alerts |
| 🧠 Smart Insights | Behavioral nudges based on spending |
| 📈 Analytics | Bar chart + pie chart with category breakdown |
| 🎯 Goals | Monthly budget, emergency fund, food & fun caps |
| 📱 PWA | Installable on Android & iOS like a native app |
| 💾 Offline | All data stored locally via localStorage |
| 🎨 Dark Theme | Eye-friendly, premium dark UI |
| 💸 BDT Support | ৳ currency with Bangladeshi payment methods |

---

## 🔧 Customization

### Change daily limit default
In `src/store.js`:
```js
const DAILY_LIMIT_DEFAULT = 1000  // Change this
```

### Add a new category
In `src/utils/constants.js`:
```js
{ id: 'Rent', label: 'Rent', icon: '🏠', color: '#your-color', bg: '#your-color18' },
```

### Change color scheme
In `src/styles/global.css`, edit the `:root` variables:
```css
--violet:  #7c6fe0;   /* Primary accent */
--green:   #3ecf8e;   /* Safe/success */
--amber:   #f5a743;   /* Warning */
--red:     #f06464;   /* Danger */
```

---

## 📦 Tech Stack

- **React 18** — UI framework
- **Vite** — Lightning-fast build tool
- **Zustand** — Lightweight global state (with localStorage persistence)
- **Recharts** — Bar & Pie charts
- **Vite PWA Plugin** — Installable Progressive Web App
- **CSS Modules** — Scoped, collision-free styles
- **Outfit Font** — Clean, modern typography

---

## 📲 Installing as a Mobile App (PWA)

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the **⋮ menu → "Add to Home Screen"**
3. Confirm — app installs like a native app!

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the **Share button → "Add to Home Screen"**
3. Confirm and enjoy!

---

Made with ❤️ for Bangladesh 🇧🇩
*"Because your money shouldn't disappear without explanation."*
