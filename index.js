// Refer sample 3 and 5 for documentation/help

const restify = require('restify');
// const path = require('path');

const { BotFrameworkAdapter, UserState, MemoryStorage, ConversationState } = require('botbuilder');

const { InitBot } = require('./bots/InitBot');
const { WelcomeDialogBot } = require('./bots/WelcomeDialogBot');

const { EchoBot } = require('./dialogs/Echo');
const { AnalyzeImage } = require('./dialogs/AnalyzeImage');
const { FaceApi } = require('./dialogs/FaceAPI');

const ECHO_DIALOG = 'echoDialog';
const IMAGE_DIALOG = 'imageDialog';
const FACE_DIALOG = 'faceDialog';

const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppID,
    appPassword: process.env.MicrosoftAppPassword
});

adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError]: ${ error }`);
    await context.sendActivity(`Oops. Something went wrong!`);
    await conversationState.delete(context);
};

const memStorage = new MemoryStorage();
const userState = new UserState(memStorage);
const conversationState = new ConversationState(memStorage);

// dialogs that can be carried out by the bots:
const echoD = new EchoBot(ECHO_DIALOG);
const imageD = new AnalyzeImage(IMAGE_DIALOG);
const faceD = new FaceApi(FACE_DIALOG);

// bots to start the dialog:
const dialog = new WelcomeDialogBot(userState, echoD, imageD, faceD);
const bot = new InitBot(userState, conversationState, dialog);

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
});
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});