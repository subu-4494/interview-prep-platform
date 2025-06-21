// this file used  to write signup and login api 
// (and created a jwt token for further communication of users in respective session)

/* how this code was written 
const registerUser = async (req, res) => {
   extract name, email, password
   check if user already exists
   hash the password
   save user to DB
   return success response (maybe with token)
};

2. Login a user

const loginUser = async (req, res) => {
   check if user exists
   compare password with hashed one
   return a JWT token if successful
};
3. Logout a user (if using sessions or tokens)
const logoutUser = (req, res) => {
   Clear cookie/token
   Send logout confirmation
};
*/

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const { name, email, password, skills } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      skills
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name,
        email,
        skills
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

const logout = (req, res) => {
  res.json({ msg: 'Logout successful' });
};

module.exports = { signup, login, logout };
