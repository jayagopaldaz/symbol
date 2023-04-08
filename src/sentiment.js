import { generateText } from './openai.js';

const sentimentPrompt = `# SENTIMENT ANALYSIS - I am Symb01ic and this is an analysis of my sentiment keywords.

### SENTIMENT KEYWORDS

Love, Mirth, Sorrow, Anger, Energy, Terror, Disgust, Astonishment

### MY CURRENT SENTIMENTS (in the form "keyword: intensity [some, relevant, trigger, words]". intensity is between 1 and 10 -- 1 being nuetral and 10 being extreme. trigger words are sampled from dialog, context, mood, sensations, and objective)

`;

const getSentiment = async (txt) => {
    const completion = await generateText(txt+sentimentPrompt, ['#']);
    return (completion);
}

export { getSentiment };