const router = require("express").Router();
const questionsController = require("../controllers/questionsController");
const midleware = require("../midleware/midlewareController");

router.get("/question",questionsController.show);
router.post("/question", questionsController.create);
router.get("/question/:id", questionsController.showById);
router.delete("/question/:id", questionsController.delete);

module.exports = router;
