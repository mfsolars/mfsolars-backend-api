const express = require("express");
let router = express.Router();
const { createContact } = require("../controllers/contactController");
const { AuthenticateUser } = require("../middleware/Authenticate");



router.post("/contact", AuthenticateUser, createContact);


module.exports = router;