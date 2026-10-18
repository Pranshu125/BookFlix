# 🎬 BookFlix — Liquid Clay & PWA Cloud Edition

BookFlix is an all-in-one digital library aggregator for E-Books, Manga, Comics, and Unabridged Audiobooks with 28 integrated search and streaming engines.

This version features:
- **Liquid Clay Design System ("Liquid Clay")**: 3D inflated pillowy cushions, dual specular & ambient inner shadows, translucent frosted liquid glass refraction, and tactile physical squish physics on tap/click (`:active`).
- **Progressive Web App (PWA)**: Full offline shell caching, standalone display mode, maskable icons, mobile safe-area insets, in-app "Install App" triggers, and an iOS "Add to Home Screen" guide sheet.
- **Zero-Config Vercel Serverless Deployment**: Ready to deploy directly to Vercel with zero external npm dependencies. Access BookFlix on your phone anywhere, anytime without ever opening `cmd` or running a local server on your PC.

---

## 🚀 How to Deploy to Vercel (Choose Option A or Option B)

### Option A: Deploy via Vercel CLI (Fastest, 2 minutes)
Open PowerShell or Terminal in this folder (`d:\Library`) and run:
```bash
npx vercel
```
1. Press `y` to confirm deployment.
2. Select your Vercel account.
3. Link to existing project? Choose `N` (create new).
4. Project name: press Enter (defaults to `bookflix`).
5. In which directory is your code located? Press Enter (`./`).
6. Want to modify these settings? Choose `N`.

To deploy to production, run:
```bash
npx vercel --prod
```
Vercel will output your live URL: **`https://bookflix-yourname.vercel.app`**!

---

### Option B: Deploy via GitHub + Vercel Dashboard
1. Initialize a Git repository and commit your files:
   ```bash
   git init
   git add .
   git commit -m "BookFlix Liquid Clay PWA"
   ```
2. Create a new repository on [GitHub](https://github.com/new) and push your code:
   ```bash
   git remote add origin https://github.com/your-username/bookflix.git
   git branch -M main
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) and click **"Add New..." ➔ "Project"**.
4. Import your `bookflix` repository and click **Deploy**.
5. Done! Any future push to GitHub will automatically update your live phone app.

---

## 📱 How to Install BookFlix on Your Phone

Once deployed to Vercel, open your live Vercel link (`https://bookflix-yourname.vercel.app`) on your phone:

### On Android (Chrome / Edge)
1. Open the URL in Google Chrome.
2. You will see an **"Install App"** button at the top and in the navigation bar. Tap it.
3. Tap **Install**. BookFlix will install onto your phone's home screen with the BookFlix logo and launch full-screen with no browser address bars!

### On iPhone / iPad (Safari)
1. Open the URL in Safari.
2. Tap the **"Install App"** button in BookFlix (or tap Safari's **Share** button `⎋` in the bottom bar).
3. Scroll down the menu and tap **"Add to Home Screen"** `⊞`.
4. Tap **"Add"** in the top-right corner.
5. Tap the BookFlix app icon on your home screen to enjoy seamless full-screen reading and audio playback anytime, anywhere!

---

## 💻 Local Execution (Optional PC Use)
You can still run BookFlix locally on your computer whenever you like:
```bash
node server.js
```
or double-click the desktop shortcut in `C:\Users\HP\OneDrive\Desktop\My Apps`.
