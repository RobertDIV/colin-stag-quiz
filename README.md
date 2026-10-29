# Colin Stag Quiz

Pass-the-phone party quiz: read out a message, Colin guesses whether he sent it or it came from a gay thirst trap / porn comment section.

Questions are stored only in the phone's browser storage. Use **Edit questions → Export backup** after every editing session.

Each game plays every Colin message, plus a random pick of Gay Porn messages to match (all of them if there are fewer).

## Develop

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

1. Create a GitHub repo and push this folder to its `main` branch.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. Each push to `main` builds and deploys to `https://<user>.github.io/<repo>/`.

## On the phone (Android)

Open the Pages URL in Chrome, then **⋮ → Add to Home screen / Install app**. It works offline after that.
