// Adapted from https://github.com/babel/example-node-server

import express from 'express';
import AWS from 'aws-sdk';

import busboyUploadRouteHandler from './busboyUploadRouteHandler';
import multipartyUploadRouteHandler from './multipartyUploadRouteHandler';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.log('Be sure you have set these environment variables:');
  console.log('AWS_ACCESS_KEY_ID="(your s3 key)" AWS_SECRET_ACCESS_KEY="(your s3 secret)"');
  process.exit(1);
}

// NOTE: if setting this up in Ubuntu for testing
// http://stackoverflow.com/questions/18947356/node-js-app-cant-run-on-port-80-even-though-theres-no-other-process-blocking-t
// To redirect port 80 to 27372, do this:
// $ sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 27372
const port = process.env.PORT || 27372;

const destinationBucket = 'some-bucket';
const s3Client = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
  // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
});

// Set up middleware for CORS headers
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

let server = express();

server.use(allowCrossDomain);

server.get('/', (req, res, next) => {
  res.send(`
    <form action='/upload-multiparty' method='post' enctype='multipart/form-data'><input type='file' name='assetFile' /><input type='submit' value='Upload via Multiparty' /></form>
    <form action='/upload-busboy' method='post' enctype='multipart/form-data'><input type='file' name='assetFile' /><input type='submit' value='Upload via Busboy' /></form>
  `);
});

server.post('/upload-multiparty', multipartyUploadRouteHandler(s3Client, destinationBucket));
server.post('/upload-busboy', busboyUploadRouteHandler(s3Client, destinationBucket));

server.listen(port);
console.log(`Server running on port ${port}...`);
