// Adapted from https://github.com/andrewrk/node-multiparty/blob/master/examples/s3.js

import multiparty from 'multiparty';
import RandomUtils from './utils/RandomUtils';

export default (s3Client, destinationBucket) => {
  return (req, res, next) => {
    // multiparty events available:
    // https://github.com/andrewrk/node-multiparty#events

    var form = new multiparty.Form();

    // https://github.com/andrewrk/node-multiparty#part-part
    form.on('part', (part) => {
      // You *must* act on the part by reading it
      // NOTE: if you want to ignore it, just call "part.resume()"

      console.log(`Processing part: ${part.byteCount}`);

      if (!part.filename) {
        // filename is not defined when this is a field and not a file
        console.log(`Got field named ${part.name}`);
        // ignore field's content
        part.resume();
      }

      if (part.filename) {
        // filename is defined when this is a file
        console.log(`Got file named ${part.name}`);

        let destPath = `${RandomUtils.randomString(2, '0123456789abcdef')}/${RandomUtils.randomString(25, 'abcdefghijklmnopqrstuvwxyz0123456789')}/${part.filename}`;

        // TODO:
        // - Content-Type header
        //    - use this? https://www.npmjs.com/package/mime
        //    - set "ContentDisposition" param

        // We can go ahead and end a response at any time if we want to
        // if (part.byteCount > 401610) {
        //   res.send('GAME OVER!');
        //   part.resume();
        // }

        var params = {
          Bucket: destinationBucket,
          Key: destPath,
          ACL: 'public-read',
          Body: part,
          ContentLength: part.byteCount
        };

        console.log(`Starting upload to S3: ${destPath}`);

        const upload = s3Client.upload(params);

        // upload.on('httpUploadProgress', (event) => {
        //   console.log('S3 upload progress:', event.loaded, '/', event.total);
        // });

        upload.send((err, data) => {
          console.log(`Finished uploading to S3: ${destPath}`);
          if (err) {
            console.log(`Error uploading to S3: ${destPath}`);
            console.log(err);
          } else {
            console.log(`Success uploading to S3: ${destPath}`);
            console.log(data);
          }

          console.log(`Sending response to client: ${destPath}`)
          res.send(destPath);
        });
      }

      part.on('error', (error) => {
        // decide what to do
        console.log('Part error');
        console.log(error);
        part.resume();
      });
    });

    form.on('error', (error) => {
      console.log('Form error');
      console.log(error);
    });

    // form.on('progress', (bytesReceived, bytesExpected) => {
    //   console.log(`Recieved: ${bytesReceived}/${bytesExpected}`);
    // });

    form.on('close', function() {
      console.log('Finished parsing form!');
    });

    form.parse(req);
  };
}
