Node.js AWS file upload streaming
=====

A Node.js server multi-part form file streaming to AWS proof of concept using [node-multiparty](https://github.com/andrewrk/node-multiparty/) and [busboy](https://github.com/mscdex/busboy).

NOTE: The Busboy example is not currently working.

Development Usage:

1. `npm install`
1. Set up environment variables on your dev environment:
  1. `export AWS_ACCESS_KEY_ID=your-aws-access-key`
  1. `export AWS_SECRET_ACCESS_KEY=your-secret-aws-access-key`
1. In `index.js`, update `destinationBucket` to an S3 bucket you have access to
1. Start dev server: `npm start`
1. In your browser, navigate to `http://localhost:27372`

To build and run:

1. `npm run build`
1. `npm run serve`
