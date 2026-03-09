const express = require("express");
const router = express.Router();
const {
    createApartment,
    addUserToApartment,
    getMyRoommates,
    createComplex,
    getAllComplexes,
    getAllApartments,
    getAdminOverview,
    assignAdminToComplex,
} = require("../controllers/aptController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

// Doar ADMIN și GOD pot crea sau aloca oameni
router.post("/", authorize("ADMIN", "GOD"), createApartment);
router.post("/assign", authorize("ADMIN", "GOD"), addUserToApartment);

// Orice USER logat își poate vedea colegii
router.get("/roommates", getMyRoommates);
router.post("/complex", authorize("ADMIN", "GOD"), createComplex);
router.get("/complexes", getAllComplexes); // Pentru dropdown-uri
router.get("/all", getAllApartments);
router.post("/complex/assign-admin", authorize("GOD"), assignAdminToComplex);
router.get("/admin/overview", authorize("ADMIN", "GOD"), getAdminOverview);
module.exports = router;
