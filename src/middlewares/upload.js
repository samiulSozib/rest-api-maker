const multer = require('multer');

// memory storage — since we only need to read fields
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
