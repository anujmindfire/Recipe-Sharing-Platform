import express from 'express';
import bodyParser from 'body-parser';
import webRoutes from './routes/index.js';
import constant from './utils/constant.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Root route
app.get('/', async (req, res) => {
  res.send(constant.general.welcome);
});

// API routes
app.use('/api', webRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGOURL, {})
  .then(() => {
    // Start the Express app only if MongoDB connection is successful
    app.listen(process.env.PORT, () => {
      console.log(constant.general.expressAppRunning(process.env.PORT));
    });
    console.log(constant.general.mongoConnectionSuccess);
  })
  .catch((err) => {
    console.error(constant.general.mongoConnectionError, err);
    process.exit(1);
  });
