# Hackathon POC (LocalStorage + GitHub Pages)

This is a minimal single-page proof-of-concept that demonstrates the core flows of a Hackathon Management app using only browser storage (LocalStorage). It's ideal for quick sharing via GitHub Pages.

## Deploy

1. Create a new GitHub repo named e.g. `hackathon-poc`.
2. Add these files and push to the `main` branch.
3. In repo settings → Pages, set source to `main` branch `/ (root)` and save. The site will be live shortly.

(Alternatively use a simple GitHub Action if you want to build a static bundle — not needed for this single-file POC.)

## Next steps (if you want to iterate from POC -> Prototype)

- Replace LocalStorage with lightweight Flask + SQLite backend (I can scaffold this).
- Add authentication (email-only or JWT stub).
- Replace vanilla UI with React + Tailwind; add Zustand for state management.
- Add team matching algorithm and scoring service.

Enjoy — tell me if you want me to generate the Prototype scaffold next (React + Flask + SQLite) or create a GitHub Action to auto-deploy.

```

```
