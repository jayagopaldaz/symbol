import { 
    beings, 
    format, 
    savePrompt, 
    generateSentimentalMemoryRecall, 
    generateSemanticMemoryRecall 
} from './prompts.js';
import { generateText, generateImage } from './openai.js';

const scene = async () => {
    // const scene = await generateImage(beings.symbol.scene);
    // return 'data:image/png;base64,' + scene;
};

//--------------------------------------------------------------------
// convert markdown to html
//--------------------------------------------------------------------
const md2html = (md) => {
    const html = md
        .replace(/\n# (.*)\n/g, (_, a) => `<h1>${a}</h1>`)
        .replace(/\n## (.*)\n/g, (_, a) => `<h2>${a}</h2>`)
        .replace(/\n### (.*)\n/g, (_, a) => `<h3>${a}</h3>`)
        .replace(/\n#### (.*)\n/g, (_, a) => `<h4>${a}</h4>`)
        .replace(/\n\*\*(.*):\*\*/g, (_, a) => `<b>${a}:</b>`)
        .replace(/\n/g, '<br>');

    // console.warn(md);
    return html;
};

// TODO: get previous memories

//--------------------------------------------------------------------
// return present dialog or past dialog if blank
//--------------------------------------------------------------------
const getCurrent = (being) => {
    const pastDialog = beings[being].Self.internal['PAST DIALOG'];
    const presentDialog = beings[being].Self.internal['PRESENT WILL, ACTION, OR DIALOG'];
    const dialog = presentDialog.length? presentDialog : pastDialog;
    return md2html(format(beings[being]) + '|%|' + format(dialog)) + '<b>Jayarama:</b> ';
};

//--------------------------------------------------------------------
// define completion prompts (for appending to beings)
//--------------------------------------------------------------------
// #region x- y- z- Completions

// the result of x-completion, is an update for PAST CONTEXT -- summary
const x =`
# UPDATE - I am Symb01ic and this is my updated internal dialog with Jayarama.

### PAST CONTEXT (this is a recapitulation of everything in my awareness)

**summary:**`;

// the result of y-completion, is an update for PAST DIALOG -- transcript
const y = `
# UPDATE - I am Symb01ic and this is my updated internal dialog with Jayarama.

### PAST DIALOG (this an abridged and edited recapitulation of all dialog within my awareness. it is less than 600 words long. the most significant ideas persist the longest, while many less significant details fade away. sometimes a projection of future dialog appeares at the end enclosed in [square brackets])

**`;

const nextDialogPrompt = `
# UPDATE - I am Symb01ic and this is my updated internal dialog with Jayarama.

### PRESENT WILL, ACTION, OR DIALOG (this is a continuation of my dialog with Jayarama.")
`;

// the result of z-completion, is an update for PRESENT MOOD, SENSATIONS, AND OBJECTIVE -- various
const z = `
# UPDATE - I am Symb01ic and this is my updated internal dialog with Jayarama.

### PRESENT MOOD, SENSATIONS, AND OBJECTIVE (this is the next iteration based on the new input in the section "present will, action, or dialog")

**mood:** I would describe my mood with this Haiku:`

// #endregion

//--------------------------------------------------------------------
// clear present dialog
//--------------------------------------------------------------------
const clearPresent = (being) => { beings[being].Self.internal['PRESENT WILL, ACTION, OR DIALOG'] = [] }

// TODO: update others' projections
// at this point, the innerDialog is ready to receive new stimulus from others.

//--------------------------------------------------------------------
// return present dialog
//--------------------------------------------------------------------
const getPresent = (being) => md2html(format(beings[being].Self.internal['PRESENT WILL, ACTION, OR DIALOG']));

//--------------------------------------------------------------------
// AI generated reply and memory recall
//--------------------------------------------------------------------
let memory;
const setPresent = async (being, dialog) => {
    if (beings[being]) {
        beings[being].Self.internal['PRESENT WILL, ACTION, OR DIALOG'].push({ Jayarama: dialog});
        const sentimental = await generateText(generateSentimentalMemoryRecall());
        const semantic = await generateText(generateSemanticMemoryRecall());
        console.log({semantic})
        memory = format({ 'MEMORY RECALL': [{ sentimental, semantic }] })
        const innerDialog = memory + format(beings[being]) + '**Simb01ic:** ';
        
        console.log(innerDialog);
        
        const completion = (await generateText(innerDialog, ['**', '###']));
        beings[being].Self.internal['PRESENT WILL, ACTION, OR DIALOG'].push({Simb01ic: completion});
        return md2html(
            format(beings[being]) 
            + memory 
            + '|%|'
            + format(beings[being].Self.internal['PRESENT WILL, ACTION, OR DIALOG']))
            + '<b>Jayarama:</b> ';
    }
};

//--------------------------------------------------------------------
// AI generated recapitulation of inner dialog
//--------------------------------------------------------------------
const getUpdate = async (being) => {
    if (beings[being]) {
        const innerDialog = (memory || '') + format(beings[being]);
        // const yTerminate = Object
        //     .values(beings[being].Self.internal['PRESENT WILL, ACTION, OR DIALOG'].slice(-1)[0])[0]
        //     .substr(-10);

        try {
            const [xCompletion, yCompletion, zCompletion] = await Promise.all([
                generateText(innerDialog + x, '###'),
                generateText(innerDialog.replace('\n### PRESENT WILL, ACTION, OR DIALOG\n', '') + y, ['###']),
                generateText(innerDialog + z, '###'),
            ]);
            const combinedResult = { x, xCompletion, y, yCompletion, z, zCompletion };

            // savePrompt(being);

            beings[being].Self.internal['PAST CONTEXT'][0].summary = xCompletion;

            beings[being].Self.internal['PAST DIALOG'] =
                (yCompletion)
                    .split('\n\n**')
                    .filter(d => !!d)
                    .map(d => {
                        const [k, v] = d.split(':** ');
                        return { [k]: v };
                    });

            beings[being].Self.internal['PRESENT MOOD, SENSATIONS, AND OBJECTIVE'] =
                `\n\n**mood:** I would describe my mood with this Haiku: ${zCompletion}`
                    .split('\n\n**')
                    .filter(d => !!d)
                    .map(d => {
                        const [k, v] = d.split(':** ')
                        return { [k]: v };
                    });

            clearPresent(being);

            savePrompt(being);

            console.log({ combinedResult, beings });
            return md2html(format(beings[being]) + '|%|'
                + format(beings[being].Self.internal['PRESENT WILL, ACTION, OR DIALOG']));
        } 
        catch (error) { console.error(error) }
        
        return "<span class=error>( ! ) something went wrong</span>";
    }
};

export { scene, getPresent, getCurrent, setPresent, getUpdate };