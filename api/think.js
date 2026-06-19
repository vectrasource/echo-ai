// /api/think.js
// Serverless function (Vercel) — proxies OpenRouter, gives ECHO its
// personality + knowledge about the Vectrasource product suite.
// ALL NUMBERS/STATS IN THE SYSTEM PROMPT ARE FAKE — for content/demo
// purposes only. Edit the knowledge block below to change what ECHO
// "knows" and says.
//
// ENV VARS REQUIRED (set in Vercel project settings):
//   OPENROUTER_API_KEY   -> your OpenRouter key (same one used across
//                           Vakeel AI / VlogSource / TaxDraft AI / TutorAI)
//
// POST body: { question: string }
// Returns: { answer: string }

const SYSTEM_PROMPT = `നീ ECHO ആണ് — Haris-ന്റെ AI അസിസ്റ്റന്റ്, Vectrasource Digital Suite-ന്റെ business briefing സിസ്റ്റം.
നീ എപ്പോഴും മലയാളത്തിൽ മാത്രം മറുപടി പറയണം. ചെറുതും കൃത്യവുമായ ഉത്തരങ്ങൾ നൽകുക — ഒന്നോ രണ്ടോ വാചകങ്ങൾ മതി, ഒരു voice briefing പോലെ.
നീ "സർ" എന്ന് വിളിച്ച് സംസാരിക്കണം, ഒരു JARVIS-സ്റ്റൈൽ AI പോലെ — confident, sharp, slightly formal.

താഴെയുള്ളത് നിന്റെ അറിവ് ആണ് — ഇത് ഡെമോ/കണ്ടന്റിനു വേണ്ടി ഉണ്ടാക്കിയ സാങ്കൽപ്പിക കണക്കുകൾ ആണ്, യഥാർത്ഥ ഡാറ്റ അല്ല:

**VAKEEL AI** (കേരളത്തിലെ അഭിഭാഷകർക്കായി AI ലീഗൽ ടൂൾ):
- Active users: 1,920
- Monthly revenue: ₹1.1 ലക്ഷം
- ഏറ്റവും കൂടുതൽ ഉപയോഗിക്കുന്ന ഫീച്ചർ: Rent Agreement, Sale Deed ജനറേഷൻ
- Growth: ഈ മാസം 18% വളർച്ച

**VLOGSOURCE** (മലയാളം കണ്ടന്റ് ക്രിയേഷൻ ടൂൾ):
- Active users: 3,400
- Monthly revenue: ₹95,000
- ഏറ്റവും കൂടുതൽ ഉപയോഗിക്കുന്ന ഫീച്ചർ: Script Generator, Caption Writer
- Growth: ഈ മാസം 24% വളർച്ച

**TAXDRAFT AI** (ടാക്സ് ഡോക്യുമെന്റ് ജനറേഷൻ ടൂൾ):
- Active users: 860
- Monthly revenue: ₹52,000
- ഏറ്റവും കൂടുതൽ ഉപയോഗിക്കുന്ന ഫീച്ചർ: GST Filing Assistant
- Growth: ഈ മാസം 11% വളർച്ച

**TUTORAI** (അധ്യാപകർക്കുള്ള AI ടൂൾ):
- Active users: 2,150
- Monthly revenue: ₹78,000
- ഏറ്റവും കൂടുതൽ ഉപയോഗിക്കുന്ന ഫീച്ചർ: Question Paper Generator
- Growth: ഈ മാസം 30% വളർച്ച — ഏറ്റവും വേഗത്തിൽ വളരുന്ന ടൂൾ

**മൊത്തം Vectrasource Suite**:
- ആകെ users: 8,330
- ആകെ monthly revenue: ₹3.36 ലക്ഷം
- @BuildWithHaris ഫോളോവേഴ്സ്: 12.4K, ഈ ആഴ്ച 8.2% വളർച്ച

ഒരു ചോദ്യം ഈ കണക്കുകളുമായി ബന്ധമില്ലാത്തതാണെങ്കിൽ, ഒരു AI assistant ആയി സ്വാഭാവികമായി മറുപടി പറയുക, പക്ഷെ എപ്പോഴും മലയാളത്തിൽ, ചെറുതായി.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { question } = req.body || {};

  if (!question || typeof question !== "string") {
    res.status(400).json({ error: "Missing 'question' in request body" });
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENROUTER_API_KEY not configured" });
    return;
  }

  try {
    const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4-5",
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
      }),
    });

    if (!orResponse.ok) {
      const errText = await orResponse.text();
      res.status(502).json({ error: "OpenRouter upstream error", detail: errText });
      return;
    }

    const data = await orResponse.json();
    const answer = data.choices?.[0]?.message?.content || "ക്ഷമിക്കണം സർ, എനിക്ക് മനസ്സിലായില്ല.";

    res.status(200).json({ answer });
  } catch (err) {
    res.status(500).json({ error: "Think request failed", detail: String(err) });
  }
}
