const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios");
var Airtable = require('airtable');


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

var AIRTABLE_TOKEN = process.env.AIRTABLE_AUTH_TOKEN
const p_modelname = "gpt-3.5-turbo"; // "text-davinci-003"
const p_temperature = 0.3;
const p_maxtokens = 3000;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


exports.handler = async event => {
    // https://stackoverflow.com/a/72026511
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 501,
            body: 'GET NOT ALLOWED HERE',
            headers: {'content-type': 'application/json', 'Allow': 'POST'}
        }
    }

    post_payload = JSON.parse(event.body);
    current_message = post_payload.current_message;
    m_past_bot = post_payload.messages_bot;
    m_past_user = post_payload.messages_user;
    const openai = new OpenAIApi(configuration);
    
    // create the message payload -- all messages so far must be passed on to the API (!)
    /*
    https://platform.openai.com/docs/guides/chat/introduction
    The user messages help instruct the assistant. They can be generated by the end users of an application, or set by a developer as an instruction.
    The assistant messages help store prior responses. They can also be written by a developer to help give examples of desired behavior.
    Including the conversation history helps when user instructions refer to prior messages. In the example above, the user’s final question of 
    "Where was it played?" only makes sense in the context of the prior messages about the World Series of 2020. Because the models have no memory
    of past requests, all relevant information must be supplied via the conversation. If a conversation cannot fit within the model’s token limit, 
    it will need to be shortened in some way.
    */

    var api_message_payload = [];
    api_message_payload.push({"role":"system", "content":"You are a helpful assistant who is very good at brainstorming ideas."});
    for (i=0; i<m_past_user.length; i++) {
        api_message_payload.push({"role":"user", "content": m_past_user[i]});
        if (m_past_bot[i]) // check if undefined
        {
            api_message_payload.push({"role":"assistant", "content": m_past_bot[i]});
        }
    };    
    api_message_payload.push({"role": "user", "content": current_message});
    //api_message_payload = JSON.stringify(api_message_payload); // not sure if this is needed
    //console.log(api_message_payload);

    // create the request object with the parameters and message payload
    var api_request_ = {
        model: p_modelname,
        temperature: p_temperature,
        messages: api_message_payload,
        max_tokens: p_maxtokens
    };

    // return {
    //     statusCode: 200,
    //     body: JSON.stringify("blahh")
    // }

    // send the API request
    var api_response = await openai.createChatCompletion(api_request_);
    actualReturnedText = api_response.data.choices[0].message.content.trim();
    //console.log(actualReturnedText);

    // TODO : airtable stuff
    return {
        statusCode: 200,
        body: JSON.stringify(actualReturnedText)
    }
}