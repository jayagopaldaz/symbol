import * as dotenv from 'dotenv'; dotenv.config();
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
    organization: 'org-o7kc3yJuwXict9wVf7XHgdO9',
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function generateText(prompt, stoppers=null) {
    console.log({ prompt });

    const response = await openai.createChatCompletion(
    // const response = await openai.createCompletion(
        {
            model: 'gpt-3.5-turbo',
            // model: 'text-davinci-003',
            // model: 'text-curie-001',
            // model: 'text-babbage-001',
            // model: 'text-ada-001',
            messages: [ { role: 'system', content: prompt }]//,
            // prompt,
            // max_tokens: 1008,
            // n: 1,
            // stop: stoppers,
            // temperature: 0.6,
        }
    );
    let msg = response.data.choices[0].message.content;
    console.log({ msg });

    if (stoppers) {
        console.log({ stoppers });
        
        (typeof stoppers == 'string' ? [stoppers] : stoppers).forEach(stopper => {
            msg = msg.split(stopper)[0];
            console.log({ stopper, msg });
        });
    }
    console.log({ msg });
    return msg;
    // return response.data.choices[0].text;
}

async function generateImage(prompt) {
    const response = await openai.createImage({
        prompt,
        n: 1,
        size: "512x512",
        response_format: 'b64_json'
    });
    return response.data.data[0].b64_json;
}

export { generateText, generateImage };
