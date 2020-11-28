const router = require("express").Router();
const { getSeats, bookSeats, updateSeat } = require("./handlers");
//////// HELPERS

router.get("/api/seat-availability", getSeats);

router.post("/api/book-seat", bookSeats);

router.put("/api/update-seat", updateSeat);

module.exports = router;
