const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const imageName = file.originalname.split(' ').join('_');
    const imageNameNoExtension = path.parse(imageName).name;
    const extension = MIME_TYPES[file.mimetype];
    console.log(imageName, extension);
    callback(null, imageNameNoExtension + '_' + Date.now() + '.' + extension);
  },
});

module.exports = multer({ storage }).single('image');
