console.log("index execute jaaddee");
const express = require('express');
const cors = require('cors');
const testRoutes = require('./routes/testRoutes');
const studentRoutes = require('./routes/studentRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const app = express();
app.use((req,res,next) => {
console.log("rqt recu", req.method,req.url);
next();
});
app.use(cors());
app.use(express.json());
app.use('/api',testRoutes);
console.log('test monté sur api');
app.use('/api/students',studentRoutes);
app.use('/api/grades',gradeRoutes);
const PORT = 4000;
app.get('/_ping', (req,res)=>{
res.send('ping ok');  });
app.listen(PORT, () => {
    console.log('index.js chargé');
});


