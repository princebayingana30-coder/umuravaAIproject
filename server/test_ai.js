const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('Testing with key:', process.env.GEMINI_API_KEY?.substring(0, 5) + '...');
  try {
    // Try different model variants
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'];
    for (const m of modelsToTry) {
      console.log('Testing model:', m);
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent('ping');
        console.log('SUCCESS with', m, ':', result.response.text());
        process.exit(0);
      } catch (e) {
        console.error('FAILED with', m, ':', e.message);
      }
    }
  } catch (e) {
    console.error('Fatal error:', e.message);
  }
}
test();
