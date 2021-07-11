const AWS = require("aws-sdk");
// lynx each image in it's own unique folder to avoid name duplicates
const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789", 10);

const AmazonS3URI = require("amazon-s3-uri");

// load config data from .env file
require("dotenv").config();
// update AWS config env data
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

// my default params for s3 upload
// I have a max upload size of 1 MB
const s3DefaultParams = {
  ACL: "public-read",
  // Bucket: process.env.S3_BUCKET_NAME,
  Conditions: [
    ["content-length-range", 0, 1024000], // 1 Mb
    { acl: "public-read" },
  ],
};

async function doesS3URLExist(imageUrl) {
  try {
    const { region, bucket, key } = AmazonS3URI(imageUrl);
    if (region && bucket && key) {
      return true;
    }
  } catch (err) {
    return false;
  }
}
module.exports.doesS3URLExist = doesS3URLExist;

// the actual upload happens here
async function handleLynxFileUpload(file) {
  const { createReadStream, filename } = await file;
  const metaData = getContentTypeByFile(filename);

  const stream = createReadStream();

  const key = nanoid();

  return new Promise((resolve, reject) => {
    s3.upload(
      {
        ...s3DefaultParams,
        // Body: createReadStream(),
        Bucket: process.env.S3_LYNX_BUCKET,
        Body: stream,
        Key: `${key}/${filename}`,
        ContentType: metaData.type,
        ACL: "public-read",
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
}

module.exports.handleLynxFileUpload = handleLynxFileUpload;

async function handleLynxFileDelete(fileKey) {
  return new Promise((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: process.env.S3_LYNX_BUCKET,
        Key: fileKey,
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      }
    );
  });
}
module.exports.handleLynxFileDelete = handleLynxFileDelete;

function getContentTypeByFile(fileName) {
  var rc = { type: "image/jpeg", extension: ".jpeg" };
  var fn = fileName.toLowerCase();

  if (fn.indexOf(".html") >= 0) {
    rc.type = "text/html";
    rc.extension = ".html";
  } else if (fn.indexOf(".css") >= 0) {
    rc.type = "text/css";
    rc.extension = ".css";
  } else if (fn.indexOf(".json") >= 0) {
    rc.type = "application/json";
    rc.extension = ".json";
  } else if (fn.indexOf(".js") >= 0) {
    rc.type = "application/x-javascript";
    rc.extension = ".js";
  } else if (fn.indexOf(".png") >= 0) {
    rc.type = "image/png";
    rc.extension = ".png";
  } else if (fn.indexOf(".jpg") >= 0) {
    rc.type = "image/jpg";
    rc.extension = ".jpg";
  } else if (fn.indexOf(".gif") >= 0) {
    rc.type = "image/gif";
    rc.type = ".gif";
  }

  return rc;
}
