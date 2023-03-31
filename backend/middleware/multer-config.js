const multer = require('multer');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    // return;
    const imageName = file.originalname.split(' ').join('_');
    const imageNameNoExtension = path.parse(imageName).name;
    const extension = MIME_TYPES[file.mimetype];
    cb(null, imageNameNoExtension + '_' + Date.now() + '.' + extension);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

module.exports = multer({
  dest: 'images',
  fileFilter: fileFilter,
  storage: fileStorage,
}).single('image');
