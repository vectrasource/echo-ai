// /api/listen.js
// Serverless function (Vercel) — proxies Google Cloud Speech-to-Text.
// Receives base64-encoded audio recorded in-browser, returns the
// transcribed Malayalam text.
//
// ENV VARS REQUIRED (set in Vercel project settings):
//   GOOGLE_TTS_API_KEY   -> same Google Cloud API key used for speak.js
//                           (Speech-to-Text and Text-to-Speech share the
//                           same Google Cloud API key/project, as long as
//                           both APIs are enabled on that project)
//
// POST body: { audioContent: base64 string, encoding: "WEBM_OPUS" | "LINEAR16", sampleRateHertz: number }
// Returns: { transcript: string }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { audioContent, encoding, sampleRateHertz } = req.body || {};

  if (!audioContent) {
    res.status(400).json({ error: "Missing 'audioContent' in request body" });
    return;
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GOOGLE_TTS_API_KEY not configured" });
    return;
  }

  try {
    const sttResponse = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding: encoding || "WEBM_OPUS",
            // sampleRateHertz must NOT be set for WEBM_OPUS — it's embedded
            // in the container and Google STT rejects explicit values for it,
            // returning empty results (which causes the "couldn't hear" fallback).
            ...(encoding && encoding !== "WEBM_OPUS" ? { sampleRateHertz } : {}),
            languageCode: "ml-IN",
            alternativeLanguageCodes: ["en-IN"],
            enableAutomaticPunctuation: true,
          },
          audio: { content: audioContent },
        }),
      }
    );

    if (!sttResponse.ok) {
      const errText = await sttResponse.text();
      res.status(502).json({ error: "STT upstream error", detail: errText });
      return;
    }

    const data = await sttResponse.json();
    const transcript =
      data.results && data.results.length > 0
        ? data.results.map((r) => r.alternatives[0].transcript).join(" ")
        : "";

    res.status(200).json({ transcript });
  } catch (err) {
    res.status(500).json({ error: "STT request failed", detail: String(err) });
  }
}
