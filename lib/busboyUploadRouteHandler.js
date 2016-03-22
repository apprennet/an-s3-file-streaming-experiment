// Adapted from https://github.com/mscdex/busboy

import Busboy from 'busboy';
import RandomUtils from './utils/RandomUtils';

export default (s3Client, destinationBucket) => {
  return (req, res, next) => {
    console.log(req.headers);

    // For additional constructor options see: https://github.com/mscdex/busboy#busboy-methods
    var busboy = new Busboy({
      headers: req.headers
      // limits: {
      //   fileSize: 10000 // bytes
      // }
    });

    // https://github.com/mscdex/busboy#busboy-special-events
    busboy.on('file', function(fieldname, fileStream, filename, encoding, mimetype) {
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      console.log(fileStream.byteCount);

      fileStream.on('data', function(data) {
        console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      });

      fileStream.on('end', function() {
        console.log('File [' + fieldname + '] Finished');

        console.log('Sending response to client');
        res.writeHead(303, { Connection: 'close', Location: '/' });
        res.end();
      });

      let destPath = `${RandomUtils.randomString(2, '0123456789abcdef')}/${RandomUtils.randomString(25, 'abcdefghijklmnopqrstuvwxyz0123456789')}/${filename}`;

      // NOTE: aws-sdk requires us to set ContentLength?
      // knox-mpu does not: https://github.com/nathanoehlman/knox-mpu
      var params = {
        Bucket: destinationBucket,
        Key: destPath,
        ACL: 'public-read',
        Body: fileStream
        // ContentLength: part.byteCount
      };

      // const options = {
      //   partSize: 1024 * 1024 * 5 // 2 MB chunks
      // };

      // https://blogs.aws.amazon.com/javascript/post/Tx3EQZP53BODXWF/Announcing-the-Amazon-S3-Managed-Uploader-in-the-AWS-SDK-for-JavaScript

      console.log('About to upload to S3: ' + destPath);
      // s3Client.upload(params, function(err, data) {
      //   console.log('Finished uploading to S3');
      //   if (err) {
      //     console.log('Error uploading to S3');
      //     console.log(err);
      //   } else {
      //     console.log('Successfully uploaded to S3');
      //     console.log(data);
      //   }
      // }).on('httpUploadProgress', function(event) {
      //   console.log('S3 upload progress:', event.loaded, '/', event.total);
      // });

      const upload = s3Client.upload(params);

      upload.on('httpUploadProgress', (event) => {
        console.log('S3 upload progress:', event.loaded, '/', event.total);
      });

      console.log('Starting S3 upload');
      upload.send((err, data) => {
        console.log('Finished uploading to S3');
        if (err) {
          console.log('Error uploading to S3');
          console.log(err);
        } else {
          console.log('Successfully uploaded to S3');
          console.log(data);
        }
      });

      // s3Client.putObject(params, function(err, data) {
      //   console.log('Finished uploading to S3');
      //   if (err) {
      //     console.log('Error uploading to S3');
      //     console.log(err);
      //   } else {
      //     console.log('Successfully uploaded to S3');
      //     console.log(data);
      //   };
      // });

    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });

    busboy.on('finish', function() {
      console.log('Done parsing form!');
      // res.writeHead(303, { Connection: 'close', Location: '/' });
      // res.end();
    });
    req.pipe(busboy);
  };
};
