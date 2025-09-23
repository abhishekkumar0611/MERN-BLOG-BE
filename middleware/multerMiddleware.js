const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const mediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const baseName = file.originalname.split('.').slice(0, -1).join('.');
    const timestamp = Date.now();
    const isVideo = ext === 'mp4';

    return {
      folder: 'posts',
      resource_type: isVideo ? 'video' : 'image',
      public_id: `${isVideo ? 'VID' : 'IMG'}-${timestamp}_${baseName}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'img', 'webp'],
      transformation: !isVideo
        ? [
            { width: 1080, height: 1080, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ]
        : undefined,
    };
  },
});

const mediaUpload = multer({ storage: mediaStorage });

module.exports = { mediaUpload };
