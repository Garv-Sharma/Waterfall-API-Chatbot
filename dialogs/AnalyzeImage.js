const { ActivityHandler, CardFactory, MessageFactory } = require('botbuilder');
const { TextPrompt, ConfirmPrompt, WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const request = require('request');

async function initialize(image){
    const subscriptionKey = '';
    const endpoint = '';
    var uriBase = endpoint + 'vision/v2.0/analyze';

    // default imageURL: 
    var imageUrl =
        'https://upload.wikimedia.org/wikipedia/commons/3/3c/Shaki_waterfall.jpg';
    if(image)
        imageUrl = image;

    // Request parameters.
    const params = {
        'visualFeatures': 'Categories,Description,Color',
        'details': '',
        'language': 'en'
    };

    var options = {
        uri: uriBase,
        qs: params,
        body: '{"url": ' + '"' + imageUrl + '"}',
        headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key' : subscriptionKey
        }
    };

    return new Promise(function(resolve, reject){
		console.log('Calling Vision API');
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

class AnalyzeImage extends ComponentDialog{
    constructor(id){
        super(id || 'imageDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.askImageURLStep.bind(this),
            this.callAPIStep.bind(this),
            this.displayResultsStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async askImageURLStep(step){
        return await step.prompt(TEXT_PROMPT, { prompt: `Enter an Image URL`});
    }

    async callAPIStep(step){
        var image = step.result;
        var returnedPromise = null;
        returnedPromise = await initialize(image);
        console.log("\tResult is:\n", returnedPromise);           
        // do not use .then function on Promise, do everything inside promise itself and return one result.
        // To use then functions, use request-promise instead. 
        // await initializePromise.then(function(result) {
        //     var jsonResponse = result;
        //     console.log('JSON Response obtained\n');
        //     // console.log(jsonResponse);
        //     return jsonResponse;
        // }, function(error){
        //     console.log(error);
        // }).then(function(result){   
        //     // chaining of 'then' to ensure sequential flow 
        if(returnedPromise)
            step.context.sendActivity(`Results obtained`);
        else
            step.context.sendActivity(`Some error occured!`);
        return step.prompt(CONFIRM_PROMPT, 'Do you want to analyze more images?', ['Yes', 'No']);
    }

    async displayResultsStep(step){
        if(step.result){
            return await step.beginDialog('imageDialog');
        }
        else{
            return await step.beginDialog('WelcomeWaterfallDialog');
        }
    }
}

module.exports.AnalyzeImage = AnalyzeImage;

