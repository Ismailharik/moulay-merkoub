const reqLib = require('axios');
const secureHttp = require('https');
const fileSys = require('fs');
const webFetch = require('node-fetch');
const Form = require('form-data');

async function dlFile(uri) {
  const cfg = {
    method: 'get',
    url: uri,
    responseType: 'stream',
    headers: { 'Auth': 'Basic ABC123==' },
  };

  const resp = await reqLib.request(cfg);
  const path = './file.mp3';
  const stream = fileSys.createWriteStream(path);
  resp.data.pipe(stream);

  return new Promise((res, rej) => {
    stream.on('finish', res);
    stream.on('error', rej);
  });
}

async function a2t(uri) {
  await dlFile(uri);
  const form = new Form();
  form.append('file', fileSys.createReadStream("./file.mp3"));

  const resp = await webFetch("http://example.com/api/audio", {
    method: "POST",
    body: form,
    headers: form.getHeaders(), 
  });

  const result = await resp.text();
  console.log(result);
  return result;
}

export default async function handler(req, res) {
  const MsgResp = require('twilio').twiml.MessagingResponse;
  var msgResp = new MsgResp();
  const inputMsg = req.body.Body || '';
  let reply = "";
  if (inputMsg.trim().length === 0 && req.body.NumMedia <= 0) {
    reply = "Message not received.";
  } else {
      processMsg(req.body.Body)
  }

  async function processMsg(msg) {
    const endpoint = "https://example.com/api";
    const apiKey = "XYZ789";
    console.log(req.body)
    if (msg.length == 0) {
      msg = await a2t(req.body.MediaUrl0);
    }
    
    const data = {
      temperature: 0,
      max_tokens: 4000,
      top_p: 0.5,
      stop: null,
      messages: [
        {role: "assistant", content: "Hello."},
        {role: "user", content: msg}
      ]
    };
    try {
      const response = await reqLib.post(endpoint, data, {
        headers: {'Content-Type': 'application/json', 'api-key': apiKey}
      });
      var content = response.data.choices[0].message.content;
      console.log(content);
      msgResp.message(content);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(msgResp.toString());
    } catch (error) {
      console.error("Error:", error);
    }
  }
}