const router = require("express").Router();
const examsController = require("../controllers/examsController");
const midleware = require("../midleware/midlewareController");

router.post("/create-exam", examsController.create);

module.exports = router;
