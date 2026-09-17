# Deployment Guide: Personal Command Center v1.0.0

## 1. Hosting Provider & Architecture
* **Target Provider**: Vercel (Hobby Tier - Free)
* **Architecture**: 100% Client-Side Static Single-Page Application (SPA)
* **Framework**: Vite + React 19 + TypeScript
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Routing Rewrites**: Handled via `vercel.json` (`/(.*) -> /index.html`)

---

## 2. Platform Comparison Summary

| Criteria | Vercel (Selected) | Cloudflare Pages | Netlify | GitHub Pages |
| :--- | :--- | :--- | :--- | :--- |
| **Free Tier Cost** | $0 (Hobby) | $0 | $0 | $0 |
| **React + Vite Support** | Native, zero-config | Native | Native | Manual base path config required |
| **GitHub Git Integration** | Automatic continuous deploy | Automatic continuous deploy | Automatic continuous deploy | GitHub Actions required |
| **Custom Domain & HTTPS** | Free auto-renewing SSL | Free auto-renewing SSL | Free auto-renewing SSL | Free auto-renewing SSL |
| **SPA Routing Support** | Handled via `vercel.json` | Handled via `_routes.json` | Handled via `_redirects` | Requires 404.html hack or hash route |
| **Monthly Bandwidth** | 100 GB | Unlimited | 100 GB | 100 GB |
| **Ease of Deployment** | 1-click import from GitHub | Git connect & build | Git connect & build | Git branch / workflow setup |

---

## 3. Important Limitations (Local-First Storage)

* **Independent Storage per Device**: `localStorage` is scoped exclusively to the browser and origin on the specific device.
  * Your laptop browser uses **Storage A**.
  * Your phone browser uses **Storage B**.
* **Data Migration**: To sync or transfer items between devices, use the built-in backup feature:
  1. Open Command Palette (`⌘K` or `Ctrl+K`).
  2. Select **"Backup & Export Data (JSON)"**.
  3. Send the `.json` file to your other device and select **"Restore / Import Data (JSON)"**.
* **Zero Backend**: No servers, no accounts, and no credentials are required or exposed.

---

## 4. How to Deploy (Step-by-Step)

### Option A: GitHub + Vercel Dashboard (Recommended)

1. **Create GitHub Repository**:
   Visit [https://github.com/new](https://github.com/new) and create a repository named:
   ```text
   personal-command-center
   ```
   *(Ensure owner is `Nozella-Alexiee`)*.

2. **Push Local Commits**:
   In your terminal, push the prepared `main` branch:
   ```bash
   cd /home/alexie/project-alex/command-center
   git push -u origin main
   ```

3. **Import to Vercel**:
   * Go to [https://vercel.com/new](https://vercel.com/new)
   * Select the `Nozella-Alexiee/personal-command-center` repository.
   * Framework Preset: **Vite**
   * Build Command: `npm run build`
   * Output Directory: `dist`
   * Click **Deploy**.

---

### Option B: Direct CLI Deployment

1. Run the interactive login in your terminal:
   ```bash
   cd /home/alexie/project-alex/command-center
   npx vercel login
   ```
2. Deploy to production:
   ```bash
   npx vercel --prod
   ```

---

## 5. How to Deploy Future Updates

Any future commits pushed to the `main` branch on GitHub will automatically trigger a new deployment on Vercel:
```bash
git add .
git commit -m "feat: your new update"
git push origin main
```
