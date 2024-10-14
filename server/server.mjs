// server.js
import express from 'express';
import cors from 'cors';
import routes from './routes.mjs';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Use the routes defined in routes.js
app.use('/api', routes);

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});