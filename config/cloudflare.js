const { S3Client } = require('@aws-sdk/client-s3');

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  },
});

// Export cả R2 client và tên bucket
module.exports = {
  r2Client: R2,
  bucketName: process.env.CLOUDFLARE_BUCKET_NAME
}; 