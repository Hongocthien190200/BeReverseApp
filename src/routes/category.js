const router = require("express").Router();
const categoryController = require("../controllers/categoriesController");
const midleware = require("../midleware/midlewareController");

router.get("/category", categoryController.show);
router.post("/category", categoryController.create);
router.get("/category/showall", categoryController.showAllSubjectByAllCategory);
router.get("/category/:id", categoryController.showSubjectByCategory);
// router.patch("/devices/:id",midleware.verifyToken, deviceController.update);
// router.get("/devices",  deviceController.show);

module.exports = router;
