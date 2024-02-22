const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://rkrishnanyadav622:rkrishnanyadav622@cluster0.bret7ja.mongodb.net/fb?retryWrites=true&w=majority';
const jwtSecretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';

mongoose.connect(mongoURI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });
    

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  role: String,
});
// const ChatSchema = new mongoose.Schema({
//   id : String,
//   data: Object,
//   paging : Object,
// });

const ChatSchema = new mongoose.Schema({
  id : String,
  name : String,
  email : String,
  messages: [{
    sender_id : String,
    sender_name : String,
    message : String,
    created_time : String,
  }],
});

const User = mongoose.model('User', UserSchema);
const Chat = mongoose.model('Chat', ChatSchema);

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { fullName, email, password} = req.body;
  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists and compare passwords
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate JWT token
      const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, jwtSecretKey, {
        expiresIn: '1h', // Token expires in 1 hour
      });

      res.status(200).json({ token : token , message : "Login Successful"});
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/getchat', async (req, res) => {
  const response = await fetch('https://facebook.com');
  const data = await response.json();
 
  try {
    for(i in data.data)
    {
      console.log(data.data[i].participants.data[0].id);
    const existingUser = await Chat.findOne({id : data.data[i].participants.data[0].id});
    if (existingUser) {
      //console.log(existingUser);
      await Chat.deleteMany({id : data.data[i].participants.data[0].id});
    }
    let chats = [];
    for(mes of data.data[i].messages.data)
    {
      const chat = {
        sender_id : mes.from.id,
        sender_name : mes.from.name,
        message : mes.message,
        created_time : mes.created_time,
      }
      chats.push(chat);
    }
    const newChat = new Chat({
      id : data.data[i].participants.data[0].id,
      name : data.data[i].participants.data[0].name,
      email : data.data[i].participants.data[0].email,
      messages : chats
    });
    await newChat.save();
  }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
