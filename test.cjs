const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/VITE_GEMINI_API_KEY=["']?(.*?)["']?(?:\r|\n|$)/);
if (match && match[1]) {
  const key = match[1];
  fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
    .then(r => r.json())
    .then(d => {
      if (d.error) {
        console.error('API Error:', d.error.message);
        return;
      }
      const models = d.models
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => m.name);
      console.log('Available Models:', models.join('\n'));
    })
    .catch(console.error);
} else {
  console.log('No api key found');
}
