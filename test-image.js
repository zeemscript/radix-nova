import 'dotenv/config';
import { experimental_generateImage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  const models = ['imagen-4.0-generate-001', 'gemini-2.5-flash-image', 'imagen-3.0-generate-002'];
  for (const m of models) {
    try {
      const { image } = await experimental_generateImage({
        model: google.image(m),
        prompt: 'A cute cat',
      });
      console.log('Success!', m, !!image);
      break;
    } catch(e) { console.error(m, 'fails', e.message); }
  }
}
run();
