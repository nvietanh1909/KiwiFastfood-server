const db = require('../config/firebase');
const { collection, addDoc, serverTimestamp } = require('firebase/firestore');

class UploadService {
  async uploadImage(file, folder = 'products') {
    try {
      // Chuyển đổi buffer thành base64
      const base64Image = file.buffer.toString('base64');
      
      // Tạo unique filename
      const timestamp = Date.now();
      const filename = `${folder}/${timestamp}-${file.originalname}`;
      
      console.log('Starting upload to Firestore...');
      console.log('Filename:', filename);
      
      // Lưu vào Firestore
      const docRef = await addDoc(collection(db, 'images'), {
        filename: filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        data: base64Image,
        folder: folder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('File uploaded successfully to Firestore');
      
      // Trả về ID của document
      return docRef.id;
    } catch (error) {
      console.error('Error uploading to Firestore:', error);
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }
}

module.exports = new UploadService(); 