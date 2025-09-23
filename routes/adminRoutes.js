const express = require("express");
const router = express.Router();
const { verifyAdmin, verifyUser } = require("../middleware/auth");
const { toggleBlockUser, togglePostApproval } = require("../controllers/adminController");



router.put("/block-user/:id", verifyAdmin, verifyUser, toggleBlockUser);
router.put("/approve-post/:id", verifyAdmin, verifyUser, togglePostApproval);

module.exports = router;
