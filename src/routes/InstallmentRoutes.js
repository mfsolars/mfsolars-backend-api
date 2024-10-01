const express = require("express");
let router = express.Router();
const { createInstallationRequest } = require("../controllers/installmentController");
const { AuthenticateUser } = require("../middleware/Authenticate");



router.post("/installation", AuthenticateUser, createInstallationRequest);


module.exports = router;