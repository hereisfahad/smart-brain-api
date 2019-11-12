const express = require("express");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const mongoose = require("mongoose"); //using mongoose to make life easier
const cors = require("cors");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://root:admin@cluster0-zule9.mongodb.net/test?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      }
    );

    console.log("db connected");
  } catch (error) {
    console.log(error.message);
  }
};
connectDB();

const app = express();
app.use(cors());
app.use(express.json({ extended: false }));

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json("incorrect form submission");
  }
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }
    res.json(user);
  } catch (error) {
    res.send(error.message);
  }
});

app.post("/register", async (req, res) => {
  let { email, name, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json("incorrect form submission");
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: "user already exists" }] });
    }
    password = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password
    });
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.put("/image", async (req, res) => {
  const { id } = req.body;
  try {
    await User.findOneAndUpdate({ _id: id }, { $inc: { entries: 1 } });
    let user = await User.findById({ _id: id }); //this returns the updated state
    return res.send({ entries: user.entries });
  } catch (e) {
    console.log(e);
    res.status(500).json({ errors: [{ msg: "could'nt fetch rank" }] });
  }
});
app.post("/delete", async (req, res) => {
  const { id } = req.body;
  try {
    await User.deleteOne({ _id: id });
    // let user = await User.findById({ _id: id }); //this returns the updated state
    return res.status(200).json({ msg: " user deleted succesfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ errors: [{ msg: "could'nt delete user" }] });
  }
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
