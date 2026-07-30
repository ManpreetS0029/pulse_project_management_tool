const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');

dotenv.config();

// Connect to Database
connectDB();

const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require('./routes/user.routes.js');
const workspaceRoutes = require('./routes/workspace.routes.js');
const projectRoutes = require('./routes/project.routes.js');
const taskRoutes = require('./routes/task.routes.js');

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task', taskRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Nodemon restart trigger - v2
