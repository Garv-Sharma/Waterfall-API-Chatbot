const { ActivityHandler, CardFactory, MessageFactory } = require('botbuilder');
const { TextPrompt, ConfirmPrompt, WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const request = require('request');

async function initialize(face){
    const subscriptionKey = '';
    const endpoint = '';
    var uriBase = endpoint + 'face/v1.0/detect/';

    // default imageURL: 
    var faceURL =
        'https://upload.wikimedia.org/wikipedia/commons/3/37/Dagestani_man_and_woman.jpg';
    if(face)
        faceURL = face;

    // Request parameters.
    const params = {
		'returnFaceId': 'true',
		'returnFaceLandmarks': 'false',
		'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
			'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
	};

    var options = {
        uri: uriBase,
        qs: params,
        body: '{"url": ' + '"' + faceURL + '"}',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : subscriptionKey
        }
    };

    return new Promise(function(resolve, reject){
		console.log('Calling Face API');
		request.post(options, (error, response, body) => {
		  if (error) {
			reject(error);
		  }
		  else{
			resolve(JSON.stringify(JSON.parse(body), null, '  '));
		  }
		})
	})
}

const TEXT_PROMPT = 'textPrompt';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const WATERFALL_DIALOG = 'waterfallDialog';

class FaceApi extends ComponentDialog{
    constructor(id){
        super(id || 'faceDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.askfaceURLStep.bind(this),
            this.callAPIStep.bind(this),
            this.displayResultsStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async askfaceURLStep(step){
        return await step.prompt(TEXT_PROMPT, { prompt: `Enter a face Image URL`});
    }

    async callAPIStep(step){
        var face = step.result;
        var returnedPromise = null;
        returnedPromise = await initialize(face);
        console.log("\tResult is:\n", returnedPromise);           

        if(returnedPromise)
            step.context.sendActivity(`Results obtained`);
        else
            step.context.sendActivity(`Some error occured!`);
        return step.prompt(CONFIRM_PROMPT, 'Do you want to analyze more faces?', ['Yes', 'No']);
    }

    async displayResultsStep(step){
        if(step.result){
            return await step.beginDialog('faceDialog');
        }
        else{
            return await step.beginDialog('WelcomeWaterfallDialog');
        }
    }
}

module.exports.FaceApi = FaceApi;