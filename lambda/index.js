/* 
* Copyright (C) 2019 Dabble Lab - All Rights Reserved
* You may use, distribute and modify this code under the 
* terms and conditions defined in file 'LICENSE.txt', which 
* is part of this source code package.
*
* For additional copyright information please
* visit : http://dabblelab.com/copyright
*/

const Alexa = require('ask-sdk-core');
const Util = require('./util.js');
//const subjects = require('./Data.js');
//const Hindi = require('./hindi.js');
//const English = require('./english.js');
//const Mathematics = require('./maths.js');
//const Science = require('./science.js');



const Hindi= {vyakaran: "Vyakaran meaning in English is GRAMMAR. Vyakaran ka matlab english me GRAMMAR hai. Get meaning and translation of Vyakaran in English language with grammar, synonyms and antonyms", 
            varnamala: "The Sanskrit word ‘Varnmala’ is made up of 2 different words. Varna and Mala. Varna means the smallest piece of a language", 
            sandhi: "the process whereby the form of a word changes as a result of its position in an utterance"
        
    };
    

const English= {Grammar:"the whole system and structure of a language or of languages in general, usually taken as consisting of syntax and morphology (including inflections) and sometimes also phonology and semantics.", 
              Poems:"a piece of writing in which the expression of feelings and ideas is given intensity by particular attention to diction (sometimes involving rhyme), rhythm, and imagery.", 
              Authors:"a writer of a book, article, or document."
        
    };
    
const Mathematics = {Algebra: "the part of mathematics in which letters and other general symbols are used to represent numbers and quantities in formulae and equations", 
                  Circles:"a round plane figure whose boundary (the circumference) consists of points equidistant from a fixed point (the centre).", 
                  Triangles: "a plane figure with three straight sides and three angles."
        
    };
    
const Science= {Evaporation:"It is the process of turning from liquid into vapour", 
              Codenstation:"water which collects as droplets on a cold surface when humid air is in contact with it.",
              WaterCycle: "the cycle of processes by which water circulates between the earth's oceans, atmosphere, and land, involving precipitation as rain and snow, drainage in streams and rivers, and return to the atmosphere by evaporation and transpiration."
        
    };


var name = "test";
let subject = "";
const subjects = ['Hindi', 'English', 'Mathematics', 'Science'];
let subjectObj = Hindi;


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    let accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;

    if (accessToken === undefined) {
      var speechText = "Please use the Alexa companion app to authenticate with your Amazon account to start using this skill.";

      return handlerInput.responseBuilder
        .speak(speechText)
        .withLinkAccountCard()
        .withShouldEndSession(false)
        .getResponse();
    } else {
    //let accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    let url = `https://api.amazon.com/user/profile?access_token=${accessToken}`;
    /*
    * data.user_id : "amzn1.account.xxxxxxxxxx"
    * data.email : "steve@dabblelab.com"
    * data.name : "Steve Tingiris"
    * data.postal_code : "33607"
    */
    let outputSpeech = 'This is the default message.';

    await getRemoteData(url)
      .then((response) => {
        const data = JSON.parse(response);
        name = data.name;
        
        
        //let sub = Object.keys(subjects);
        
        outputSpeech = `Hi ${data.name}. I can teach you ` ; // I have yor email address as: ${data.email}.`;
        
        for (let i = 0;i <subjects.length-1;i++){
            outputSpeech+=subjects[i]+", "
        }
        outputSpeech += ` and `+ subjects[subjects.length-1] + `. What do you want to learn?`;
      })
      .catch((err) => {
        //set an optional error message here
        outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();
    }

  },
};


const teachTopics = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'teachTopics';
  },
  handle(handlerInput) {
    let slots = handlerInput.requestEnvelope.request.intent.slots;
    subject = slots['subject'].value;
    let s = handlerInput.requestEnvelope.request.intent.slots.subject.slotValue.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    
    let speechText = `You chose the subject: ${subject}. I can tell you about `;
    
    if (s === 'Mathematics') subjectObj = Mathematics;
    else if (s === 'Science') subjectObj = Science;
    else if (s === 'English') subjectObj = English;
    else if (s === 'Hindi') subjectObj = Hindi;
    
    const subtopics = Object.keys(subjectObj);
    for (let i = 0;i <subtopics.length-1;i++){
            speechText+=subtopics[i]+", "
        }
    speechText += ` and `+ subtopics[subtopics.length-1] + `. What do you want to learn?`;
    

    return handlerInput.responseBuilder
      .speak(speechText)
      //.withSimpleCard('What did I learn', speechText)
      .getResponse();
  },
};



const teachSubTopic = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'teachSubTopic';
  },
  handle(handlerInput) {
    let slots = handlerInput.requestEnvelope.request.intent.slots;
    let subTopic = slots['topic'].value;
    let st = handlerInput.requestEnvelope.request.intent.slots.topic.slotValue.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    
    let speechText = `You chose the sub topic: ${subTopic} from the topic ${subject}. ${subTopic} is `;
    
    if (subjectObj === Hindi){
        if (st in Hindi)
            speechText += Hindi[st];
        else
            speechText += "Not Found.";
    }
    
    else if (subjectObj === English){
        if (st in English)
            speechText += English[st];
        else
            speechText += "Not Found.";
    }
    
    else if (subjectObj === Mathematics){
        if (st in Mathematics)
            speechText += Mathematics[st];
        else
            speechText += "Not Found.";
    }
    
    
    else if (subjectObj === Science){
        if (st in Science)
            speechText += Science[st];
        else
            speechText += "Not Found.";
    }
    
    
    
    
    speechText += ` Do you want to learn more?`
    
    
    

    return handlerInput.responseBuilder
      .speak(speechText)
      //.withSimpleCard('What did I learn', speechText)
      .getResponse();
  },
};





const GetRemoteData = {
  canHandle(handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetRemoteData');
  },
  async handle(handlerInput) {
    let outputSpeech = 'This is the default message.';

    await getRemoteDataforapi('http://api.open-notify.org/astros.json')
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech = `There are currently ${data.people.length} astronauts in space. `;
        for (let i = 0; i < data.people.length; i += 1) {
          if (i === 0) {
            // first record
            outputSpeech = `${outputSpeech}Their names are: ${data.people[i].name}, `;
          } else if (i === data.people.length - 1) {
            // last record
            outputSpeech = `${outputSpeech}and ${data.people[i].name}.`;
          } else {
            // middle record(s)
            outputSpeech = `${outputSpeech + data.people[i].name}, `;
          }
        }
      })
      .catch((err) => {
        console.log(`ERROR: ${err.message}`);
        // set an optional error message here
        // outputSpeech = err.message;
      });

    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();
  },
};

const PlayAudio = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" 
      &&      handlerInput.requestEnvelope.request.intent.name === "PlayAudio"
    );
  },
  handle(handlerInput) {
        const audioUrl = Util.getS3PreSignedUrl("Media/czgCo2NN-ve.mp3").replace(/&/g,'&amp;');
        return handlerInput.responseBuilder
                .speak(`There you go ${name}, please listen to the audio <audio src="${audioUrl}"/>`)
                .getResponse();
    }
};




const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak(`Sorry I ran into an error. The error message was: ${error.message}`)
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    //MyNameIsIntentHandler,
    GetRemoteData,
    teachTopics,
    teachSubTopic,
    PlayAudio,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

  const getRemoteData = function (url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? require('https') : require('http');
      const request = client.get(url, (response) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(new Error('Failed with status code: ' + response.statusCode));
        }
        const body = [];
        response.on('data', (chunk) => body.push(chunk));
        response.on('end', () => resolve(body.join('')));
      });
      request.on('error', (err) => reject(err))
    })
  };
  
  
 const getRemoteDataforapi = (url) => new Promise((resolve, reject) => {
  const client = url.startsWith('https') ? require('https') : require('http');
  const request = client.get(url, (response) => {
    if (response.statusCode < 200 || response.statusCode > 299) {
      reject(new Error(`Failed with status code: ${response.statusCode}`));
    }
    const body = [];
    response.on('data', (chunk) => body.push(chunk));
    response.on('end', () => resolve(body.join('')));
  });
  request.on('error', (err) => reject(err));
});