const express = require("express");
const { upload} = require("../middlewares/uploadMiddleware");
const { uploadToGCS, ensureAuthenticated, getUploadedFiles, getSubjects,updateFileDetails, deleteFile }  = require("../controllers/filesController")
const router = express.Router();

router.post("/upload", ensureAuthenticated, upload.single("file"), uploadToGCS, (req, res) => {
    res.json({
        message: "File uploaded successfully",
        fileUrl: req.file.cloudStoragePublicUrl,
    });
});
router.get("/", ensureAuthenticated, getUploadedFiles);
router.get('/subjects', ensureAuthenticated, getSubjects);
router.put("/:id", ensureAuthenticated, updateFileDetails);
router.delete("/:id", ensureAuthenticated, deleteFile);

module.exports = router;