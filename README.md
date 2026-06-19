# ECHO v2 — Conversational Neural Interface

Upgraded from the scripted demo to a **real clap-activated conversational AI**.
You clap → ECHO listens → you ask anything about your Vectrasource tools →
ECHO answers live in Malayalam.

**All numbers ECHO knows are fake/demo stats** — see `api/think.js` to edit them.

## How it works now

1. On page load, a one-time **"Enable Microphone"** overlay appears (browsers
   require a user click before granting persistent mic access — this is the
   only button in the whole experience).
2. After that, ECHO runs **fully hands-free**: it passively listens for a
   loud clap in the background.
3. **Clap detected** → red pulse "listening" state → records ~3.5 seconds of
   your spoken question.
4. Audio is sent to **Google Cloud Speech-to-Text** (`/api/listen`) → Malayalam
   transcript.
5. Transcript is sent to **OpenRouter (Claude Haiku)** (`/api/think`) with a
   system prompt that knows fake stats for all 4 Vectrasource tools (Vakeel AI,
   VlogSource, TaxDraft AI, TutorAI) — generates a short Malayalam answer,
   JARVIS-style ("സർ" address, confident tone).
6. Answer is sent to **Google Cloud TTS** (`/api/speak`, same as before) and
   spoken aloud, with the caption shown on screen.
7. If the answer mentions stats-related words, the four data panels flash up
   briefly for visual punch — otherwise it's just the spoken answer.
8. Resets to idle, waiting for the next clap.

## New files

- `api/listen.js` — Speech-to-Text proxy (Google Cloud)
- `api/think.js` — LLM brain proxy (OpenRouter) + ECHO's fake knowledge base
- `index.html` — updated: removed tap button, added mic-enable gate, clap
  detector, and the full record → transcribe → think → speak loop

## Environment variables required (Vercel project settings)

| Variable | Used by | Notes |
|---|---|---|
| `GOOGLE_TTS_API_KEY` | `speak.js`, `listen.js` | Same key powers both TTS and STT, as long as both APIs are enabled on that Google Cloud project (Cloud Console → APIs & Services → enable "Cloud Speech-to-Text API" alongside the existing "Cloud Text-to-Speech API") |
| `OPENROUTER_API_KEY` | `think.js` | Same key used across Vakeel AI / VlogSource / TaxDraft AI / TutorAI |

After adding/changing env vars, **redeploy** in Vercel for them to take effect.

## Editing what ECHO knows

Open `api/think.js` and edit the `SYSTEM_PROMPT` string — it's plain Malayalam
text with fake stats per tool (users, revenue, top feature, growth %). Add,
remove, or change numbers freely; nothing here touches real data.

## Tuning the clap sensitivity

In `index.html`, inside `clapLoop()`:

```js
if (peak > 195 && !conversationBusy && !clapCooldown) {
```

- Lower `195` if claps aren't being detected (more sensitive, but may
  false-trigger on loud ambient noise).
- Raise it if it's triggering too easily.

Recording duration after a clap (how long ECHO listens for your question)
is set here:

```js
const audioBase64 = await recordQuestion(persistentStream, 3500);
```

`3500` = 3.5 seconds. Increase if you tend to ask longer questions.

## Notes

- Mic access requires HTTPS — works fine on your Vercel deployment, won't
  work on plain `http://`.
- The mic-enable overlay only needs to be dismissed once per page load/session.
- If `OPENROUTER_API_KEY` or `GOOGLE_TTS_API_KEY` aren't set, the relevant
  step fails gracefully — ECHO will give a fallback Malayalam apology line
  instead of crashing.
- Same deployment pattern as your other tools: push to GitHub → Vercel
  auto-deploys.
