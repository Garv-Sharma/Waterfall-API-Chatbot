const { ActivityHandler, CardFactory } = require('botbuilder');

// const WELCOMED_USER = 'welcomedUserProperty';
// userState WELCOMED_USER to re-welcome user and re-start dialog at end of dialog or 'quit' from Echo Bot

class InitBot extends ActivityHandler{
    constructor(userState, conversationState, dialog){
        super();
        if (!conversationState) throw new Error('[InitBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[InitBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[InitBot]: Missing parameter. WelcomeDialog is required');

        // this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);    // onMembersAdded 
        // this.dialogFinished = userState.createProperty('dialogFinished');   

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        // user welcomed here first time (once only)
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity('Bot Initializing...');
                    await this.sendIntroCard(context);
                }
            }
            await next();
        });

        this.onMessage(async (context, next) => {
            console.log('new Message activity');
            await this.dialog.run(context, this.dialogState);
            await next();
        });

        this.onDialog(async (context, next) => {
            console.log('new Dialog activity');
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });
    }

    // outside contructor always(because a function)
    async sendIntroCard(context){
        const card = CardFactory.heroCard(
            'Welcome to My Bot!\nWhat is your name?',
            ['https://docs.botframework.com/static/devportal/client/images/bot-framework-default.png']
        );
        await context.sendActivity({ attachments: [card]});
    }
}

module.exports.InitBot = InitBot;