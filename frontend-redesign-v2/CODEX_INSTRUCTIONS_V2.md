# Codex: apply design v2 ("campus notice board")

The folder `frontend-redesign-v2/` has the NEW frontend. It REPLACES any earlier redesign (v1: gradient/pastel/glass look) and the original old UI. Paths mirror the project root.

## Hard rules
1. Only change the **visual layer** (markup, classNames, CSS, animation, copy). Keep ALL existing Supabase, auth, RLS, upload and routing logic working.
2. Do NOT add libraries. Only `framer-motion` is needed (install if missing). Fonts come from `next/font/google`.
3. **NO GIT / GITHUB ACTIONS.** No git init/add/commit/push, no branches, no PRs.
4. Keep the code beginner-friendly with the short comments already in the files.
5. Never hardcode keys. Do not touch `.env.local`.

## Design in one paragraph
Friendly "campus notice board", NOT a futuristic/AI look. Warm paper background, flat solid colours, small rounded corners, items shown as slightly tilted notes with a piece of tape, a handwritten font for tiny labels, a marker-highlight on one word, plain human copy. The ONLY brand colours are the three below (neutrals paper/ink are fine). Animations stay (page fade-up, scroll reveal, staggered cards, sticky notes dropping in, highlight drawing in, hover straighten/lift, "Returned" stamp, modal, toast, slowly wandering doodles) and all stop for `prefers-reduced-motion`.

```css
:root { --color-stop-1: #43cb4e; --color-stop-2: #41cb91; --color-stop-3: #43c0cb; }
```
Green = Found / main buttons, Cyan = Lost, Mint = highlights, tape and active chips. Text on top of these colours is always dark (`--lf-on-color`).

DO NOT use: gradient text, gradient buttons/backgrounds, glassmorphism, big blurred blobs, purple/indigo, floating cards, counters, marquee, emoji inside buttons/headings.

## Step 1: clean up v1 leftovers (if present)
Delete these old files if they exist: `components/Stats.jsx`, `components/CountUp.jsx`, `components/CategoryMarquee.jsx`. Remove all imports of them.
In `app/globals.css` keep only the Tailwind import line(s) at the top, delete every other old/v1 style, then paste the new `app/globals.css` content under it.

## Step 2: copy the files
`app/layout.js`, `app/template.js`, `app/page.js`, `app/items/page.js`, `app/globals.css`, everything in `components/` and `lib/categories.js`, `lib/format.js`. Do not overwrite `lib/supabaseClient.js`.
- If the old layout has providers/wrappers, keep them around `{children}`.
- If the old `app/items/page.js` has working fetch logic that differs, keep that logic and only use the new markup, `FilterBar` and `ItemCard` (the page must also accept `?q=` and `?category=` in the URL).
- `Navbar.jsx`, `LatestItems.jsx` and `app/items/page.js` import `lib/supabaseClient` (they accept `export const supabase` or a default export). Adjust if the project uses another name.

## Step 3: restyle the remaining pages (keep their logic!)
Wrap each page in `<div className="lf-page">`. Use plain, friendly button text (no emoji).

### /login
```jsx
<div className="lf-auth lf-card">
  <h1 className="lf-page-title">Welcome back</h1>
  <div className="lf-seg">
    <button type="button" className={`lf-seg-btn ${mode === "signin" ? "is-active" : ""}`}>Sign in</button>
    <button type="button" className={`lf-seg-btn ${mode === "signup" ? "is-active" : ""}`}>Create account</button>
  </div>
  <div className="lf-field">
    <label className="lf-label" htmlFor="email">Email</label>
    <input id="email" className="lf-input" type="email" />
  </div>
  {/* same pattern for password */}
  {error && <p className="lf-error" role="alert">{error}</p>}
  <button className="lf-btn lf-btn-primary" type="submit" disabled={loading}>{loading ? "One sec…" : "Continue"}</button>
</div>
```

### /items/new (ItemForm)
```jsx
<form className="lf-form lf-card" onSubmit={handleSubmit}>
  <div className="lf-seg" role="radiogroup" aria-label="Item type">
    <button type="button" className={`lf-seg-btn ${type === "lost" ? "is-lost" : ""}`} onClick={() => setType("lost")}>I lost it</button>
    <button type="button" className={`lf-seg-btn ${type === "found" ? "is-found" : ""}`} onClick={() => setType("found")}>I found it</button>
  </div>
  <div className="lf-field">
    <label className="lf-label" htmlFor="title">What is it?</label>
    <input id="title" className="lf-input" placeholder="e.g. Blue steel bottle" />
    {errors.title && <p className="lf-error">{errors.title}</p>}
  </div>
  {/* description -> <textarea className="lf-input">, category -> <select className="lf-input">, location / date / contact -> <input className="lf-input"> */}
  <label className="lf-drop">
    <span>Tap to add a photo (images only, max 3 MB)</span>
    <input type="file" accept="image/*" onChange={onFile} />
    {previewUrl && <img className="lf-preview" src={previewUrl} alt="Preview of the selected item" />}
  </label>
  {/* "hidden detail" (found items only): animate in/out with AnimatePresence + motion.div (height 0 -> auto, opacity) and add <p className="lf-help"> explaining it is never shown publicly */}
  <button className="lf-btn lf-btn-primary" type="submit" disabled={submitting}>{submitting ? "Posting…" : "Post it"}</button>
</form>
<Toast show={showToast} message="Posted! Fingers crossed." onClose={closeToast} />  {/* closeToast wrapped in useCallback */}
```
Preselect the type from the URL (`?type=lost` / `?type=found`) with `useSearchParams`.

### /items/[id]
```jsx
<div className="lf-page">
  <Link href="/items" className="lf-link">← Back to the board</Link>
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
        <dt>Where</dt><dd>{item.location}</dd>
        <dt>When</dt><dd>{item.date_happened}</dd>
        <dt>Status</dt><dd>{item.status}</dd>
      </dl>
      <p>{item.description}</p>
      {user ? (
        <div className="lf-note"><b>How to reach them</b>{item.contact_info}</div>   {/* keep the existing WhatsApp/email button logic */}
      ) : (
        <Link href="/login" className="lf-btn lf-btn-primary">Log in to see contact details</Link>
      )}
      {isOwner && item.hidden_detail && <div className="lf-note"><b>Your secret detail (only you can see this)</b>{item.hidden_detail}</div>}
      {isOwner && item.status !== "returned" && <ReturnedButton onConfirm={markReturned} />}
    </div>
  </div>
</div>
```
`markReturned` = the existing async function doing `supabase.from("items").update({ status: "returned" }).eq("id", item.id)`; it must `throw` on error and update local state on success. Import `emojiFor` from `lib/categories.js`.

## Step 4: check
1. `npm run lint` and `npm run build`, fix all errors.
2. Search for leftovers: purple/indigo hex codes, `bg-gradient`, `backdrop-blur` on cards, old blob background, duplicate `<AnimatedBackground />`.
3. Tell Zuber how to test: Home (sticky notes drop in, highlight draws under "find it", sections reveal on scroll, doodles drift), light/dark toggle, `/items` (filters, `?category=Keys`, skeletons, empty state, tilted notes straighten on hover), `/items/new`, `/items/[id]`, mark-as-returned (stamp + modal), mobile width (about 380px), and OS "reduce motion" ON (movement must stop but the page must stay fully visible).
