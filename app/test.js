const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.match(/GROQ_API_KEY=(.+)/)?.[1]?.trim();
console.log('GROQ 키 앞자리:', key?.slice(0, 15) + '...');

const Groq = require('groq-sdk');
const client = new Groq({ apiKey: key });

client.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: '안녕하세요' }],
  max_tokens: 100,
}).then(r => {
  console.log('성공:', r.choices[0].message.content);
}).catch(e => {
  console.log('오류 코드:', e.status);
  console.log('오류 메시지:', e.message);
});