const fetch = require("node-fetch");

async function translateToEnglish(text) {
  const res = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text
    )}&langpair=es|en`
  );
  const data = await res.json();
  return data.responseData.translatedText;
}

module.exports = translateToEnglish;
