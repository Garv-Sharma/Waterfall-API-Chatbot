const { ActivityHandler, ActionTypes, AttachmentLayoutTypes, CardFactory } = require('botbuilder');

const { 
    ChoiceFactory,
    ChoicePrompt, 
    ComponentDialog, 
    DialogSet, 
    DialogTurnStatus,
    TextPrompt, 
    WaterfallDialog, 
} = require('botbuilder-dialogs');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const NAME_PROMPT = 'NAME_PROMPT';
const USER_PROFILE = 'USER_PROFILE'; 
const WELCOME_WATERFALL_DIALOG = 'WelcomeWaterfallDialog';

class WelcomeDialogBot extends ComponentDialog {
    constructor(userState, echoD, imageD, faceD) {
        super('WelcomeDialogBot');

        if (!echoD) throw new Error('[MainDialog]: Missing parameter \'echoDialog\' is required');
        if (!imageD) throw new Error('[MainDialog]: Missing parameter \'imageDialog\' is required');
        if (!faceD) throw new Error('[MainDialog]: Missing parameter \'faceDialog\' is required');

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(echoD);
        this.addDialog(imageD);
        this.addDialog(faceD);
        this.addDialog(new WaterfallDialog(WELCOME_WATERFALL_DIALOG, [
            this.activityStep.bind(this),
            this.directUser.bind(this)
        ]));

        this.initialDialogId = WELCOME_WATERFALL_DIALOG;
    }

    async run(turnContext, accessor){       
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if(results.status === DialogTurnStatus.empty){
            await dialogContext.beginDialog(this.id);
        }
    }

    async activityStep(step){
        // await step.context.sendActivity(`Welcome!`)
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Select what you want to do:',
            choices: ChoiceFactory.toChoices([
                'Talk to Echo Bot','Analyze Image','Detect Face'])
        });
    }

    async directUser(step){
        if(step.result.value == 'Talk to Echo Bot'){
            await this.sendEchoBotIntroCard(step);            
            return await step.beginDialog('echoDialog');
        }
        else if(step.result.value == 'Analyze Image'){
            await step.context.sendActivity(`Initializing Image APIs!`);
            return await step.beginDialog('imageDialog');
        }
        else if(step.result.value == 'Detect Face'){
            await step.context.sendActivity(`Initializing Face APIs!`);
            return await step.beginDialog('faceDialog');
        }
        else{
            // return await step.endDialog();
            // restart the dialog
            return await step.replaceDialog(this.initialDialogId);
        }
    }    

    async sendEchoBotIntroCard(step){
        const card = CardFactory.heroCard(
            'Welcome to Echo Bot!\nSay something to the bot...',
            ['https://docs.botframework.com/static/devportal/client/images/bot-framework-default.png']
        );
        await step.context.sendActivity({ attachments: [card]});
    }
}

module.exports.WelcomeDialogBot = WelcomeDialogBot;
