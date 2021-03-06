const express = require("express");
const User = require("../Models/User");
const mongoose = require("mongoose");
const { json } = require("body-parser");
const { find } = require("../Models/User");

//Setting the route middleware
const route = express.Router();

route.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.json({ message: error });
  }
});

route.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.json({ message: error });
  }
});

//FIND USER BY NAME ON THE LOGIN SCREEN
route.get("/filtered/:username", async (req, res) => {
  try {
    const filtername = req.params.username;
    const filtered = await User.find({
      username: filtername,
    });
    res.json(filtered);
  } catch (error) {
    res.json({ message: error });
  }
});

//------------

//ADD NEW USER FROM SIGNIN SCREEN
route.post("/addnewuser", (req, res) => {
  const newUser = new User({
    image: req.body.image,
    username: req.body.username,
    password: req.body.password,
    goal: req.body.goal,
    currentWeight: req.body.currentWeight,
    daily: [],
  });
  User.find({ username: req.body.username }, function (err, docs) {
    if (docs.length) {
      console.log("Name already taken");
    } else {
      newUser.save().then(() => res.json());
    }
  });
  /*
  try {
    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (error) {
    res.json({ message: error });
  }*/
});

//PUSH NEW DAILY INTO ARRAY OF SPECIFIC PERSON NEEDS TO UPDATE CURRENT WEIGHT
route.put("/updatedaily", async (req, res) => {
  const newFeed = {
    _id: mongoose.Types.ObjectId(),
    date: req.body.date,
    currentWeight: req.body.todays_weight,
    todays_weight: req.body.todays_weight,
    walking_time: req.body.walking_time,
    running_time: req.body.running_time,
    exercising_time: req.body.exercising_time,
  };

  try {
    const userfound = await User.updateOne(
      { username: req.body.username }, //!NEED TO SEE IF DATES IN DAILY EXIST
      { $addToSet: { daily: [newFeed] } }
    );
    res.json(userfound);
  } catch (error) {
    res.json(error);
  }
});

//GET DATA BY DATE SPECIFIC USER AND DATE
route.get("/checkdailydata/:username/:date", async (req, res) => {
  try {
    const userfound = await User.find({
      username: req.params.username,
      //"daily.date": req.body.date,
    });
    const userdaily = await userfound[0].daily.find(
      (daily) => daily.date === req.params.date
    );
    const data = [];
    data.push(userdaily);
    res.json(data);
  } catch (error) {
    res.json(error);
  }
});

//UPDATE A SPECIFIC DAILY OF USER
route.put("/updatefeed/:username", async (req, res) => {
  try {
    const filtername = req.body.username;
    const daily = await User.updateOne(
      { username: filtername, "daily.date": req.body.date },
      {
        $set: {
          "daily.$.date": req.body.date,
          "daily.$.todays_weight": req.body.todays_weight,
          "daily.$.walking_time": req.body.walking_time,
          "daily.$.running_time": req.body.running_time,
          "daily.$.exercising_time": req.body.exercising_time,
        },
      }
    );
    res.json(daily);
  } catch (error) {
    res.json(error);
  }
});

//UPDATES THE CURRENT WEIGHT OF USER
route.post("/update/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      user.currentWeight = req.body.currentWeight;
      user
        .save()
        .then(() => res.json(`currentWeight updated`))
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
});

//DELETE SPECIFIC DATE OF USER
route.delete("/delete/:username/:date", async (req, res) => {
  try {
    const filtername = req.params.username;
    const daily = await User.updateOne(
      { username: filtername, "daily.date": req.params.date },
      {
        $pull: {
          daily: { date: req.params.date },
        },
      }
    );
    res.json(daily);
  } catch (error) {
    res.json(error);
  }
});

//UPDATE THE GOAL OF A SPECIFIC USER
route.put("/changegoal/:username", async (req, res) => {
  try {
    const userUpdated = await User.updateOne(
      {
        username: req.params.username,
      },
      { goal: req.body.goal }
    );
    res.json(userUpdated);
  } catch (error) {
    res.json({ message: error });
  }
});

route.put("/updateuser/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      (user.image = req.body.image),
        (user.username = req.body.username),
        (user.password = req.body.password);

      user.save().then(() => res.json(`Person updated`));
    })
    .catch((err) => res.status(400).json(err));
});

module.exports = route;
