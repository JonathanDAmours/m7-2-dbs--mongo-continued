"use strict";
const { MongoClient } = require("mongodb");
require("dotenv").config();
console.log(process.env);
const { MONGO_URI } = process.env;
const assert = require("assert");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);
  await client.connect();
  const db = client.db("ticketbooker");

  const results = await db.collection("seats").find().toArray();

  const seats = {};
  results.forEach((seat) => {
    seats[seat._id] = seat;
  });

  if (results.length > 0) {
    res.status(200).json({
      seats: seats,
      numOfRows: 8,
      seatsPerRow: 12,
    });
  } else {
    res.status(400).json({
      message: "Error",
      status: 400,
    });
  }

  client.close();
};

const bookSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);

  const { seatId, creditCard, expiration, email, fullName } = req.body;
  const _id = seatId;
  const query = { _id };
  let lastBookingAttemptSucceeded = false;

  console.log(req.body, "THIS IS ITTTTT");

  const newValue = {
    $set: { isBooked: true, fullName: fullName, email: email },
  };

  if (!creditCard || !expiration) {
    return res.status(400).json({
      status: 400,
      message: "Please provide credit card information!",
    });
  }

  if (lastBookingAttemptSucceeded) {
    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    return res.status(500).json({
      message: "An unknown error has occurred. Please try your request again.",
    });
  }
  lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

  try {
    await client.connect();
    const db = client.db("ticketbooker");

    const check = await db.collection("seats").findOne(query);

    if (check.isBooked === false) {
      const results = await db.collection("seats").updateOne(query, newValue);
      assert.equal(1, results.matchedCount);

      res.status(200).json({
        status: 200,
        success: true,
      });
    } else {
      res.status(400).json({
        message: "Seat is already booked.",
      });
    }
  } catch (err) {
    console.log(err);
  }

  client.close();
};

const updateSeat = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);
  const { _id, fullName, isBooked, email } = req.body;
  const query = { _id };
  const newValue = {
    $set: { isBooked: isBooked, fullName: fullName, email: email },
  };
  try {
    await client.connect();
    const db = client.db("ticketbooker");
    const result = await db.collection("seats").updateOne(query, newValue);
    assert.strictEqual(1, result.matchedCount);
    res.status(201).json({ status: 201, _id, success: true });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { getSeats, bookSeats, updateSeat };
