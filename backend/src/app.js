// create server
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes')
const foodRoutes = require('./routes/food.routes')
const foodPartnerRoutes = require('./routes/foodpartner.routes')

const app = express();

app.use(cors({
     origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL].filter(Boolean),
     credentials: true
}));
app.use(express.json());
app.use(cookieParser());
 
app.get("/", (req,res)=>{
     res.send("Hello");
})

app.use('/api/auth',authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);

module.exports = app;
