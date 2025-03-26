const { r2Client, bucketName } = require('../config/cloudflare');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const sharp = require('sharp');

class UploadService {
  async uploadImage(file, folder = 'products') {
    try {
      // Tạo unique filename
      const timestamp = Date.now();
      const filename = `${folder}/${timestamp}-${file.originalname}`;
      
      console.log('Starting upload to Cloudflare R2...');
      console.log('Filename:', filename);
      
      // Tối ưu ảnh trước khi upload
      const optimizedBuffer = await sharp(file.buffer)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload to Cloudflare R2
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: optimizedBuffer,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000', // Cache trong 1 năm
      });

      await r2Client.send(command);
      
      console.log('File uploaded successfully to Cloudflare R2');
      
      // Trả về URL của file
      return `https://pub-8f93a6916cdb4dc794cd302df2e65ea0.r2.dev/${filename}`;
    } catch (error) {
      console.error('Error uploading to Cloudflare R2:', error);
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }

  async getImage(key) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const response = await r2Client.send(command);
      return response.Body;
    } catch (error) {
      console.error('Error getting image from R2:', error);
      throw new Error(`Error getting image: ${error.message}`);
    }
  }

  async deleteImage(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      await r2Client.send(command);
      console.log('Image deleted successfully from R2');
    } catch (error) {
      console.error('Error deleting image from R2:', error);
      throw new Error(`Error deleting image: ${error.message}`);
    }
  }
}

module.exports = new UploadService(); 