import fs from 'fs';

const logPath = 'C:\\Users\\Daya Shankar\\.gemini\\antigravity-ide\\brain\\124d79f5-f903-4d3c-8e56-4d66d4e678ef\\.system_generated\\logs\\transcript.jsonl';

function run() {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const obj = JSON.parse(line);
      const str = JSON.stringify(obj);
      if (str.includes("Failed to load") || str.includes("Supabase") || str.includes("from('employees')")) {
        console.log(`=== Step ${obj.step_index} ===`);
        console.log(str.substring(0, 1000));
      }
    } catch (e) {}
  }
}

run();
