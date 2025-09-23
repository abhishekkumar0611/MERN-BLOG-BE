
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const path = require('path');




dotenv.config();


connectDB();

const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes'); // for register/login
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');


const app = express();


app.use(cookieParser());

app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true
    }
));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')))


app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);


app.get('/', (req, res) => {
    res.send('API is running...');
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});


