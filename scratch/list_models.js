const apiKey = process.argv[2];
const versions = ['v1', 'v1beta'];

async function check() {
  for (const v of versions) {
    console.log(`--- Checking ${v} ---`);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/${v}/models?key=${apiKey}`);
      const data = await res.json();
      if (data.models) {
        data.models.forEach(m => console.log(m.name));
      } else {
        console.log(JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }
  }
}
check();
