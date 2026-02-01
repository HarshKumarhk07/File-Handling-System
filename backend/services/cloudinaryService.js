const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (fileBuffer, userId, originalName, mimetype) => {
    return new Promise((resolve, reject) => {
        const isImage = mimetype && mimetype.startsWith('image/');

        const options = {
            folder: `minidrive/${userId}`,
            resource_type: isImage ? 'auto' : 'raw', // Use 'raw' for non-images to prevent corruption
            public_id: originalName.split('.')[0] + '_' + Date.now(),
        };

        // Only apply image-specific optimizations
        if (isImage) {
            options.format = 'webp';
            options.quality = 'auto';
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};
