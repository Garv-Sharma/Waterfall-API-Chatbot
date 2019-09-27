const { ActivityHandler, CardFactory, MessageFactory } = require('botbuilder');
const { TextPrompt, WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class EchoBot extends ComponentDialog {
    constructor(id){
        super(id || 'echoDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.userInputStep.bind(this),
            this.echoConvoStep.bind(this),
            this.exitStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    // start echo bot activities in steps
    async userInputStep(step){
        return await step.prompt(TEXT_PROMPT);
    }

    async echoConvoStep(step){
        var userInput = step.result;
        switch(userInput.toLowerCase()){
            case 'quit':
            case 'exit':
            case 'stop':
                await step.context.sendActivity(`Bye`);
                await this.sendExitCard(step);
                return await step.next();
                break;
            default:
                await step.context.sendActivity(`Echo bot says: ${ userInput }`);
                // restart the echo dialog all over again
                return await step.beginDialog('echoDialog');
        }
    }

    async exitStep(step){
        // restart main dialog here
        return await step.beginDialog('WelcomeWaterfallDialog');
    }

    async sendExitCard(step){
        const card = CardFactory.heroCard(
            'Echo Bot has left!',
        );
        await step.context.sendActivity({ attachments: [card]});
    }
}

module.exports.EchoBot = EchoBot;