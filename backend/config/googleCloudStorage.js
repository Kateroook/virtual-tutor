const {Storage} = require("@google-cloud/storage");
const storage = new Storage({
    keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE, // Service account JSON file
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);

module.exports = { storage, bucket };