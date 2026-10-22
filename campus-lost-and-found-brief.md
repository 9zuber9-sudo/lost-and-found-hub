# Campus Lost and Found: Project Brief for AI Agent

> Read this whole file first. It is the single source of truth for the project.
> Then follow the **Prompt Pack** (Section 9) one prompt at a time. Do not skip ahead.

---

## 1. About the Project

| | |
|---|---|
| **Name** | Campus Lost and Found |
| **Event** | TechSpace BuildLab '26 (Beginner, Solo track) |
| **Builder** | Zuber, 1st year BCA (beginner: explain code simply, add short comments) |
| **Repo** | https://github.com/Techspace-srmuh/lost-and-found-hub |

**Problem:** Students lose items (ID cards, bottles, books) on campus. People who find them don't know the owner, and WhatsApp group messages get buried, so items are rarely returned.

**Solution:** One simple, beautiful website where students post lost and found items with photos, search/filter them, contact the poster, and mark items as returned.

---

## 2. Tech Stack (fixed, do not change)

- **Framework:** Next.js (App Router) + JavaScript (no TypeScript unless asked)
- **Styling:** Tailwind CSS (colours as CSS variables so light/dark mode is easy)
- **Animation:** Framer Motion (`framer-motion`) + CSS keyframes
- **Font:** Plus Jakarta Sans (via `next/font/google`)
- **Backend:** Supabase (Postgres database, Auth, Storage, Row Level Security)
- **Hosting (later):** Vercel

---

## 3. Core Features (MUST be completed)

1. **Report a lost item**: title, description, category, location, date, photo
2. **Post a found item**: same form, with an extra optional "hidden detail" (see Section 6)
3. **Search and filter**: by keyword, type (lost/found), category, status
4. **Item details page**: full info and a way to contact the poster
5. **Mark as returned**: only the person who posted the item can do this

## 4. Stretch Features (only after Core works)

1. **Admin approval**: new posts stay "pending" until an admin approves them
2. Item auto-expires/hides after 30 days
3. Email or in-app notification when someone contacts the poster

> Note: the dark/light mode toggle is now part of the design system (Section 5), so it is no longer a stretch feature.

---

## 5. Design and Animation Direction (REDESIGNED)

### Vibe
**Warm, friendly, modern, and alive. Balanced, not futuristic.** Think a polished student-startup app: calm colours, soft shadows, smooth motion. Every page should have some animation, but nothing flashy or distracting. Avoid neon glows, dark "cyberpunk" looks, heavy glass effects and busy particles.

### Design tokens (define as CSS variables, used by Tailwind)

| Token | Light (default) | Dark |
|---|---|---|
| Background | `#fbf8f3` (warm cream) | `#14131f` |
| Surface / cards | `#ffffff` | `#1e1d2d` |
| Text | `#1d1b2e` | `#f1effa` |
| Muted text | `#6b6880` | `#a19eb8` |
| Border | `#ece7dd` | `#2d2b42` |
| Brand (indigo-violet) | `#5b5bf0` to `#8b5cf6` | `#8b8bff` to `#a78bfa` |
| **Lost** (coral) | `#f2605c` | `#ff7d79` |
| **Found** (green) | `#12a583` | `#3ddbb0` |

- Light theme is the default. Dark theme follows the phone setting (`prefers-color-scheme`) and can be switched with a toggle button. Save the choice in a `data-theme` attribute on `<html>`.
- Lost = coral and Found = green everywhere (tags, buttons, accents) so users can tell them apart at a glance.
- Font: Plus Jakarta Sans. Big bold headings with tight letter spacing, relaxed body text.
- Shapes: `rounded-3xl` cards, pill-shaped buttons and tags, soft shadows, generous spacing.
- Mobile-first: most students will use phones.
- Accessible: good contrast, visible focus outlines, alt text on all images.

### Animated background (`<AnimatedBackground />`)
- Fixed behind everything (`position: fixed`, `z-index: -1`, `pointer-events: none`).
- **3 large soft pastel blobs** (lavender, peach, mint in light mode; deeper muted versions in dark mode) with `filter: blur(90px)`, opacity about 0.5.
- Blobs drift slowly with **pure CSS keyframes** (`translate` + `scale`, 30 to 45 second loops, `alternate`).
- Plus a faint **dot grid** (`radial-gradient`, low opacity).
- **Must stop all animation when `prefers-reduced-motion` is set.**

### Page animations (Framer Motion)
- **Navbar:** floating pill (sticky, rounded-full, light blur, border), slides down on load. Includes the theme toggle (icon rotates on hover).
- **Hero:** text fades up one line at a time. Headline has a slow animated gradient shimmer. A live search bar and two buttons: "I lost something" (coral) and "I found something" (green). On the right (desktop) or below (mobile), 3 item cards float gently up and down at slightly different speeds.
- **Category strip:** a sideways auto-scrolling marquee of category pills (ID Cards, Bottles, Books, Electronics, Keys, Clothing, Bags, Other). Pauses on hover.
- **How it works:** 3 cards (Post it, Search and match, Return it), revealed on scroll.
- **Stats row:** numbers count up when scrolled into view.
- **Scroll reveal:** every section fades up when it enters the screen (`whileInView`, `once: true`).
- **ItemCard:** staggered entrance, lifts about 6px with a soft glow on hover, image zooms slightly. Lost/Found tag pill on each card.
- **Filter chips:** active chip animates between options (`layoutId`). Items animate out and in when filtering (`AnimatePresence`).
- **Buttons:** `whileHover` scale 1.03, `whileTap` scale 0.97.
- **Returned badge:** green pill with a check mark that draws itself.
- **Toasts and modals:** smooth slide/fade in and out (e.g. "Item marked as returned").
- **Loading:** skeleton cards with a soft shimmer. Friendly animated empty state.
- **Call-to-action band** near the bottom with a slowly moving gradient.
- Page transitions between routes: short fade-up.

### Animation rules
- Keep durations between 0.3s and 0.9s (ease-out). Background loops 30s or more.
- Animate only `transform` and `opacity` where possible (smooth on low-end phones).
- Use `useReducedMotion()` from Framer Motion and a CSS `@media (prefers-reduced-motion: reduce)` block to turn animations off.

---

## 6. Important Security and Privacy Rules

These are the parts beginners usually miss. Treat them as required.

1. **Authentication required** to post, to see contact details, and to mark returned (Supabase Auth; prefer college email only).
2. **Row Level Security (RLS) ON for every table.** Only the owner can update or delete their own item. Do not rely on hiding buttons in the UI.
3. **Contact details** are shown only to logged-in users.
4. **Proof of ownership:** for found items, the poster may enter a "hidden detail" (e.g. the name on an ID card, a sticker on a bottle). It is **never shown publicly**. The owner must describe it when contacting.
5. Never commit secrets. Use `.env.local`. Only the public `anon` key goes in the browser.
6. Validate inputs and limit image size (max 3 MB, images only).

---

## 7. Database Design (Supabase / Postgres)

### Table: `items`
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK, default `gen_random_uuid()`) | |
| user_id | uuid | references `auth.users`, default `auth.uid()` |
| type | text | `'lost'` or `'found'` |
| title | text | required |
| description | text | |
| category | text | ID Card, Bottle, Books, Electronics, Keys, Clothing, Other |
| location | text | where lost/found |
| date_happened | date | |
| image_url | text | public URL from Storage |
| contact_info | text | phone, email or WhatsApp |
| hidden_detail | text | optional, found items only, never shown publicly |
| status | text | `'pending'`, `'open'`, `'returned'` (default `'open'`; `'pending'` if admin approval is on) |
| created_at | timestamptz | default `now()` |

### Storage
- Bucket: `item-images` (public read, authenticated upload)

### RLS policies (summary)
- **SELECT:** anyone can read items where `status` in (`open`, `returned`). Contact info is only exposed to logged-in users (use a view or fetch it separately).
- **INSERT:** authenticated users only, with `user_id = auth.uid()`
- **UPDATE / DELETE:** only where `user_id = auth.uid()`

---

## 8. Suggested Folder Structure

```
app/
  layout.js
  globals.css              # design tokens (CSS variables), keyframes
  page.js                  # Home: hero + marquee + how it works + stats + latest items + CTA
  items/
    page.js                # Browse, search and filter
    new/page.js            # Post lost/found form
    [id]/page.js           # Item detail
  login/page.js
  admin/page.js            # (stretch)
components/
  AnimatedBackground.jsx
  Navbar.jsx
  ThemeToggle.jsx
  Hero.jsx
  CategoryMarquee.jsx
  Reveal.jsx               # reusable fade-up-on-scroll wrapper
  CountUp.jsx              # animated number
  ItemCard.jsx
  ItemForm.jsx
  FilterBar.jsx
  ReturnedButton.jsx
  Toast.jsx
lib/
  supabaseClient.js
.env.local                 # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 9. PROMPT PACK (use in order)

### How to use
1. Paste this entire file into your AI agent first.
2. Then send **one prompt at a time**. Test it in the browser before moving on.
3. If something breaks, paste the exact error message and ask the agent to fix it.
4. The agent must never touch Git or GitHub (no commit, push, branch or PR). I will do that myself.

---

### Prompt 0: Setup
```text
Using the brief above, create a new Next.js project (App Router, JavaScript) with Tailwind CSS. Install @supabase/supabase-js and framer-motion. Create lib/supabaseClient.js that reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from .env.local. Add a .env.local.example file. Create the folder structure from Section 8 with empty placeholder files. Load the Plus Jakarta Sans font with next/font/google. Explain each step in simple words because I am a beginner.
```

### Prompt 1: Database, storage and security
```text
Write the complete Supabase SQL I should paste into the SQL Editor to: (1) create the `items` table exactly as in Section 7, with CHECK constraints for `type` and `status`; (2) enable Row Level Security; (3) create policies so anyone can read open/returned items, only authenticated users can insert with user_id = auth.uid(), and only the owner can update or delete. Also tell me step by step how to create the public `item-images` storage bucket and the storage policy that lets only logged-in users upload. Explain every policy in one simple sentence.
```

### Prompt 2: Authentication
```text
Add Supabase Auth using email + password (and magic link if easy). Build /login with sign up and sign in, and a Navbar that shows Login or the user's email with a Logout button. Add a simple helper/hook to get the current user. Protect /items/new so logged-out users are redirected to /login. Keep the code beginner-friendly with short comments. (Basic styling only for now, the full design comes in Prompt 3.)
```

### Prompt 3: Design system, animated background and Home page
```text
Build the design system from Section 5. Do these in order:
1. In app/globals.css, define all colour tokens as CSS variables for light (default) and dark mode (via prefers-color-scheme and a data-theme attribute), and connect them to Tailwind.
2. Build <AnimatedBackground /> with 3 soft pastel blurred blobs drifting slowly (pure CSS keyframes, 30 to 45 second loops) plus a faint dot grid. Fixed behind all content, lightweight, and disabled when prefers-reduced-motion is set. Add it to app/layout.js.
3. Build the floating pill Navbar (sticky, rounded-full, light blur) with a ThemeToggle button.
4. Build reusable <Reveal /> (fade-up on scroll with Framer Motion whileInView, once) and <CountUp /> components.
5. Build the Home page: Hero (staggered fade-up text, gradient shimmer headline, search bar, "I lost something" coral button, "I found something" green button, 3 gently floating example cards), CategoryMarquee (auto-scrolling pills, pause on hover), "How it works" (3 cards), stats row with count-up numbers, a latest-items section (use sample data for now), and a gradient call-to-action band.
Make it mobile-first and respect prefers-reduced-motion everywhere. Do not add libraries beyond Tailwind and framer-motion.
```

### Prompt 4: Post an item (with photo)
```text
Build ItemForm and the /items/new page in the new design (cards, pill buttons, Lost = coral and Found = green toggle). Fields: type (lost/found toggle), title, description, category dropdown, location, date, contact info, photo upload (images only, max 3 MB, with a live preview), and an optional "hidden detail" field shown only when type is "found" (animate it in and out). On submit: upload the image to the `item-images` bucket, get its public URL, insert a row into `items`, then redirect to the item's detail page. Show loading state, validation errors, and an animated success toast. Explain how the upload works in simple terms.
```

### Prompt 5: Browse, search and filter
```text
Build /items. Fetch items from Supabase and show them in a responsive grid of ItemCard components with a staggered Framer Motion entrance, hover lift (about 6px) with soft glow, and a slight image zoom. Add a FilterBar made of pill chips: keyword search (title + description), type (All/Lost/Found), category, and status (Open/Returned). The active chip should animate with layoutId, and cards should animate in and out with AnimatePresence when filters change. Debounce the search input. Show a friendly animated empty state and loading skeleton cards with a soft shimmer. Add a green animated "Returned" badge on returned items.
```

### Prompt 6: Item detail and contact
```text
Build /items/[id]. Show the large photo, title, Lost/Found tag, category, location, date, description and status. If the user is logged in, show the contact info with a "Contact on WhatsApp" or email button; if not, show a "Log in to see contact details" button. Never display `hidden_detail` to anyone except the owner of the post. Add a smooth fade-up page transition.
```

### Prompt 7: Mark as returned
```text
Add a ReturnedButton on the detail page that appears only if the logged-in user is the owner (user_id matches). Clicking it opens a smooth confirmation modal, updates status to 'returned', and plays a small success animation (check mark that draws itself, optional light confetti) plus a toast. Confirm the database RLS also blocks other users from doing this, and show me how to test that by trying as a different account.
```

### Prompt 8 (Stretch): Admin approval
```text
Add admin approval: new items are inserted with status 'pending' and are not visible publicly. Create an `admins` table (or a role flag) and an /admin page (same design system) where admins can see pending items and Approve or Reject them. Update RLS so only admins can change status from 'pending'. Keep it simple and explain the security model.
```

### Prompt 9: Polish, test and deploy
```text
Review the whole project for: design consistency with Section 5 (colours, fonts, spacing, Lost = coral and Found = green), light and dark mode on every page, mobile responsiveness, accessibility (alt text, focus states, contrast), loading and error states, and animation performance on a low-end phone. Make sure prefers-reduced-motion is respected. Give me a manual test checklist for all 5 core features, including security tests (logged-out user, a different user trying to edit someone else's item). Then walk me through deploying to Vercel and adding the environment variables. Do NOT run any git or GitHub commands. I will push the code to GitHub myself.
```

---

## 10. Rules for the AI Agent

- Follow the stack and structure above. Do not add libraries without asking.
- Work in **small steps**: one prompt, then wait for me to test.
- Write simple code with short comments, and explain new concepts in plain English.
- **NO GIT / GITHUB ACTIONS.** Do NOT run `git init`, `git add`, `git commit`, `git push`, create branches, or open pull requests. Do not create, modify or connect any remote repository. I (Zuber) will handle all Git and GitHub work myself. Only create and edit project files on disk.
- Never hardcode keys. Never skip RLS.
- Keep the visual style balanced and friendly (Section 5). Do not make it neon, dark-only or overly futuristic.
- After each step, tell me exactly how to test it in the browser.
- If something in this brief is unclear, ask one short question instead of guessing.

---

## 11. Final Acceptance Checklist

- [ ] Users can sign up, log in and log out
- [ ] Lost and found items can be posted with a photo
- [ ] Items can be searched and filtered
- [ ] Detail page shows info; contact details only to logged-in users
- [ ] Only the poster can mark an item as returned (verified in the database, not just the UI)
- [ ] New design applied on every page (cream light theme, dark mode toggle, Lost = coral, Found = green)
- [ ] Animated background and UI animations work and respect reduced motion
- [ ] Works well on mobile
- [ ] Deployed on Vercel and the GitHub repo is up to date
- [ ] (Stretch) Admin approval works

**Final result:** Students can post lost and found items with photos, search for them, and contact the poster. Once an item is given back, it can be marked as returned.
