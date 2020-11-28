const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;
const assert = require("assert");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const generateSeats = () => {
  // ----------------------------------
  const seats = {};
  const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
  for (let r = 0; r < row.length; r++) {
    for (let s = 1; s < 13; s++) {
      seats[`${row[r]}-${s}`] = {
        _id: `${row[r]}-${s}`,
        price: 225,
        isBooked: Math.random() * 7 < 1,
      };
    }
  }
  return Object.values(seats);
};

const seatImport = async () => {
  const client = await MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("ticketbooker");
    const seats = generateSeats();
    const result = await db.collection("seats").insertMany(seats);
    assert.equal(seats.length, result.insertedCount);
  } catch (err) {
    console.log(err.stack);
  }

  client.close();
};

module.exports = { seatImport };
