// /api/speak.js
// Serverless function (Vercel) — proxies Google Cloud TTS so the API key
// never touches the browser. Same pattern as Jarvis Booth's api/generate.js.
//
// ENV VARS REQUIRED (set in Vercel project settings):
//   GOOGLE_TTS_API_KEY   -> Google Cloud Text-to-Speech API key
//
// POST body: { text: string, mode: "idle" | "listening" | "briefing" }
// Returns: { audioContent: base64 mp3 string }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { text } = req.body || {};

  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Missing 'text' in request body" });
    return;
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GOOGLE_TTS_API_KEY not configured" });
    return;
  }

  // Wrap in SSML for natural pacing — slight pause after sir/title address,
  // measured pace overall so it reads as composed/authoritative rather than rushed.
  const ssml = `<speak><prosody rate="97%" pitch="-1st">${text}</prosody></speak>`;

  try {
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { ssml },
          voice: {
            languageCode: "ml-IN",
            name: "ml-IN-Wavenet-D",
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 1.0,
            pitch: -1.0,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      res.status(502).json({ error: "TTS upstream error", detail: errText });
      return;
    }

    const data = await ttsResponse.json();
    res.status(200).json({ audioContent: data.audioContent });
  } catch (err) {
    res.status(500).json({ error: "TTS request failed", detail: String(err) });
  }
}
