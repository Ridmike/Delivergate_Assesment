import express from 'express';
import "dotenv/config";
import { connectDB } from './lib/db.js';
import authRoutes from './routes/authRoutes.js';
import todoRoutes from './routes/todoRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth",authRoutes)
app.use('/api/todos', todoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on post ${PORT}`);
  connectDB();
});