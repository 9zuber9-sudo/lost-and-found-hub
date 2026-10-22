# Codex: replace the old frontend with this new design

You are working in the Next.js (App Router, JavaScript) + Tailwind + Framer Motion + Supabase project "Campus Lost and Found".
The folder `frontend-redesign/` contains the NEW frontend. Its structure mirrors the project root (`app/`, `components/`, `lib/`).

## Hard rules
1. Only change the **visual layer** (markup, classNames, CSS, animation). Keep ALL existing Supabase, auth, RLS, upload and routing logic working.
2. Do NOT add libraries. Only `framer-motion` is needed; install it if it is missing.
3. **NO GIT / GITHUB ACTIONS.** Do not run git init/add/commit/push, do not create branches or PRs.
4. The user (Zuber) is a beginner: keep code simple, keep the short comments that are already in the new files.
5. Never hardcode keys. Never touch `.env.local`.

## Step 1: copy the files
- `app/globals.css`: KEEP the Tailwind import line(s) at the top of the old file (`@import "tailwindcss";` or `@tailwind ...`), delete the old custom styles (old dark-navy `body`, old glass cards, old `AnimatedBackground` CSS), then paste the whole new file content under them.
- `app/layout.js`: replace with the new one (font via `next/font`, theme script, `<AnimatedBackground />`, `<Navbar />`). If the old layout has providers/wrappers, keep them around `{children}`.
- `app/template.js`: new file (page fade-up transition). Do not wrap children in another `<main>` in the layout.
- `app/page.js` (Home) and `app/items/page.js` (Browse): replace. If the old `app/items/page.js` already has working fetch/filter logic that differs from the new one, keep the old logic and only use the new markup, `FilterBar` and `ItemCard`.
- `components/`: copy all files. Delete old versions of components with the same names first. Remove old components that are no longer used.
- `lib/categories.js`, `lib/format.js`: new helpers. Do not overwrite `lib/supabaseClient.js`.

`Navbar.jsx`, `Stats.jsx`, `LatestItems.jsx` and `app/items/page.js` import `lib/supabaseClient`. They accept either `export const supabase` or a default export. If the project uses another name, fix those imports.

## Step 2: restyle the remaining pages (keep their logic!)
All new classes start with `lf-`. Use them in the existing JSX instead of the old classNames. Wrap each page in `<div className="lf-page">`.

### /login
```jsx
<div className="lf-auth lf-card lf-card-flat">
  <h1 className="lf-page-title">Welcome back</h1>
  <div className="lf-seg">   {/* Sign in / Sign up switch */}
    <button type="button" className={`lf-seg-btn ${mode === "signin" ? "is-active" : ""}`}>Sign in</button>
    <button type="button" className={`lf-seg-btn ${mode === "signup" ? "is-active" : ""}`}>Sign up</button>
  </div>
  <div className="lf-field">
    <label className="lf-label" htmlFor="email">Email</label>
    <input id="email" className="lf-input" type="email" />
  </div>
  {/* same pattern for password */}
  {error && <p className="lf-error" role="alert">{error}</p>}
  <button className="lf-btn lf-btn-primary" type="submit" disabled={loading}>{loading ? "Please wait…" : "Continue"}</button>
</div>
```

### /items/new (ItemForm)
```jsx
<form className="lf-form lf-card lf-card-flat" onSubmit={handleSubmit}>
  <div className="lf-seg" role="radiogroup" aria-label="Item type">
    <button type="button" className={`lf-seg-btn ${type === "lost" ? "is-lost" : ""}`} onClick={() => setType("lost")}>😟 I lost it</button>
    <button type="button" className={`lf-seg-btn ${type === "found" ? "is-found" : ""}`} onClick={() => setType("found")}>🙌 I found it</button>
  </div>
  <div className="lf-field">
    <label className="lf-label" htmlFor="title">Title</label>
    <input id="title" className="lf-input" />
    <p className="lf-error">{errors.title}</p>   {/* render only when there is an error */}
  </div>
  {/* description -> <textarea className="lf-input">, category -> <select className="lf-input">, location/date/contact -> <input className="lf-input"> */}
  <label className="lf-drop">
    <span>📷 Tap to add a photo (images only, max 3 MB)</span>
    <input type="file" accept="image/*" onChange={onFile} />
    {previewUrl && <img className="lf-preview" src={previewUrl} alt="Preview of the selected item" />}
  </label>
  {/* Animate the optional "hidden detail" field in/out with AnimatePresence + motion.div (height 0 -> auto, opacity) when type === "found" */}
  <button className="lf-btn lf-btn-primary" type="submit" disabled={submitting}>{submitting ? "Posting…" : "Post item"}</button>
</form>
<Toast show={showToast} message="Item posted successfully!" onClose={closeToast} />  {/* closeToast wrapped in useCallback */}
```
Also read `?type=lost` or `?type=found` from the URL (`useSearchParams`) to preselect the type (the Home page buttons link to it).

### /items/[id] (detail page)
```jsx
<div className="lf-page">
  <Link href="/items" className="lf-link">← Back to all items</Link>
  <div className="lf-detail">
    <div className="lf-detail-media">
      {item.image_url ? <img src={item.image_url} alt={item.title} /> : <span aria-hidden="true">{emojiFor(item.category)}</span>}
    </div>
    <div className="lf-detail-body">
      <div>
        <span className={`lf-tag ${item.type === "lost" ? "lf-tag-lost" : "lf-tag-found"}`}>{item.type}</span>
        <h1 className="lf-page-title">{item.title}</h1>
      </div>
      <dl className="lf-kv">
        <dt>Category</dt><dd>{item.category}</dd>
        <dt>Location</dt><dd>{item.location}</dd>
        <dt>Date</dt><dd>{item.date_happened}</dd>
        <dt>Status</dt><dd>{item.status}</dd>
      </dl>
      <p>{item.description}</p>
      {user ? (
        <div className="lf-note"><b>Contact</b>{item.contact_info}</div>        /* keep the existing WhatsApp/email button logic */
      ) : (
        <Link href="/login" className="lf-btn lf-btn-primary">Log in to see contact details</Link>
      )}
      {isOwner && item.hidden_detail && <div className="lf-note"><b>Your hidden detail (only you see this)</b>{item.hidden_detail}</div>}
      {isOwner && item.status !== "returned" && <ReturnedButton onConfirm={markReturned} />}
    </div>
  </div>
</div>
```
`markReturned` = the existing async function that runs `supabase.from("items").update({ status: "returned" }).eq("id", item.id)`; it must `throw` on error and update the local item state on success. Import `emojiFor` from `lib/categories.js`.

## Step 3: check
1. Run `npm run lint` and `npm run build`; fix every error (for example unused imports or `react/no-unescaped-entities`).
2. Look for leftovers: old dark-navy background styles, old class names, duplicate `<AnimatedBackground />`.
3. Tell Zuber how to test in the browser: Home (hero animates in, cards float, marquee scrolls, numbers count up, sections reveal on scroll), theme toggle (🌙/☀️), /items (filters, skeletons, empty state, hover lift), /items/new, /items/[id], mark-as-returned modal, mobile width (about 380px), and "Reduce motion" turned on in the OS (animations must stop).

Design summary for reference: light cream default theme, optional dark mode, brand indigo-violet, Lost = coral, Found = green, font Plus Jakarta Sans, rounded cards and pill buttons, soft pastel drifting background, balanced animation (not futuristic).
