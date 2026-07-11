/**
 * Netlify Function: sentence
 *
 * Generates a short example sentence for a spelling word using the Gemini API.
 * Used by SpellCoach quiz mode for words that aren't in the built-in dictionary
 * (custom words added to MyLists, homophones like rain/reign, etc.).
 *
 * The Gemini API key is read from the Netlify environment variable GEMINI_API_KEY.
 * It is NEVER sent to the client. The browser only ever sees the resulting sentence.
 *
 * Endpoint:  GET /.netlify/functions/sentence?word=<word>
 * Returns:   { sentence: "...", word: "..." }
 */

exports.handler = async (event) => {
  const rawWord = (event.queryStringParameters && event.queryStringParameters.word) || '';
  const word = rawWord.trim().toLowerCase();

  // Basic input validation — letters, hyphens, apostrophes only; max 50 chars.
  if (!word || word.length > 50 || !/^[a-z\-']+$/i.test(word)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Invalid word' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API key not configured on server' })
    };
  }

  const prompt =
    'Write one short, simple sentence (12 words or fewer) using the word "' + word + '". ' +
    'The sentence should give clear context so a child hearing it knows which word is meant ' +
    '(important for homophones like rain vs. reign or their vs. there). ' +
    'Use grade-school vocabulary. Return ONLY the sentence — no quotes, no labels, no extra text.';

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 80 }
        }),
        signal: ctrl.signal
      }
    );
    clearTimeout(timer);

    if (!res.ok) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Upstream error', status: res.status })
      };
    }

    const data = await res.json();
    let sentence = '';
    try {
      sentence = data.candidates[0].content.parts[0].text || '';
    } catch (_) {
      sentence = '';
    }
    sentence = sentence.trim().replace(/^["'\s]+|["'\s]+$/g, '').trim();

    if (!sentence) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Empty response from model' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence: sentence, word: word })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server error', detail: String(err && err.message ? err.message : err) })
    };
  }
};
