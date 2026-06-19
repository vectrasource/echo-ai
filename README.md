# ECHO — Neural Interface (Content Demo Build)

A JARVIS-style voice briefing HUD, speaking Malayalam, built for @BuildWithHaris content.
**All stats shown (followers, revenue, users, reach) are fake/demo numbers** — edit them in
`index.html` under `FAKE_STATS` and the `BRIEFING_LINE` string.

## What it does

1. Idle state — wireframe icosahedron core pulses gently, cyan glow, ambient HUD readouts.
2. Tap the activate button (bottom center) → mic listens (red pulse state, ~1.4s).
3. ECHO greets you in Malayalam (cyan, calm).
4. Pivots into **business briefing mode** — core shifts amber, four data panels fly in
   around the HUD (Followers / Revenue / Active Users / Content Reach), and ECHO reads
   out the numbers in Malayalam.
5. Holds for a few seconds, then resets to idle.

Works as a **visual-only demo with no backend** (captions still play, just silent) — so you
can record footage immediately. Wire up the API route below for real Malayalam voice.

## Deploy to Vercel (same pattern as Jarvis Booth)

1. Create a new folder / repo, drop in:
   - `index.html` (root)
   - `api/speak.js`
2. Push to GitHub → import into Vercel (or `vercel --prod` from the folder).
3. In Vercel project settings → **Environment Variables**, add:
   - `GOOGLE_TTS_API_KEY` = your Google Cloud Text-to-Speech API key
     (same one used for Jarvis Booth's `ml-IN-Wavenet-D` voice)
4. Redeploy after adding the env var.
5. Visit your deployed URL on a device with mic permission allowed — tap the core to trigger.

## Customizing for different takes/videos

- **Numbers**: edit `FAKE_STATS` object near the top of the `<script>` in `index.html`.
- **Spoken lines**: edit `GREETING_LINE` and `BRIEFING_LINE` — keep them in Malayalam Unicode
  (not Manglish) for correct `ml-IN-Wavenet-D` pronunciation.
- **Voice pacing**: tweak `prosody rate` / `pitch` in `api/speak.js` SSML wrapper, or
  `speakingRate` / `pitch` in the `audioConfig`.
- **Clap-trigger instead of tap**: there's a commented-out `enableClapDetect()` block at the
  bottom of the script — uncomment it to make ECHO respond to a loud clap instead of/alongside
  the button. Useful for the "I clap and Jarvis responds" demo moment you described.
- **Colors**: CSS custom properties at the top (`--core-cyan`, `--amber`, etc.) control the
  whole palette — cyan = idle/listening-adjacent, amber = briefing mode.

## Notes

- Mic access requires HTTPS (Vercel gives you this by default) — won't work on plain `http://`.
- Browser will prompt for mic permission on first tap; make sure to allow it before recording.
- If `GOOGLE_TTS_API_KEY` isn't set, the demo still runs — it just skips audio and times the
  caption display instead, so you can test the visual flow before the backend is wired up.
- Same TTS pattern/voice as your Jarvis Booth build (`ml-IN-Wavenet-D`, SSML pacing) for
  consistent brand voice across your content.
