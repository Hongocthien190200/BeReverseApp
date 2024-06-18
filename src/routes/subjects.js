const router = require("express").Router();
const subjectsController = require("../controllers/subjectsController");
const midleware = require("../midleware/midlewareController");

router.get("/subject", subjectsController.show);
router.post("/subject", subjectsController.create);
// router.patch("/devices/:id",midleware.verifyToken, deviceController.update);
// router.get("/devices",  deviceController.show);

module.exports = router;
