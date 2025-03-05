// src/server.ts

import express, { Express } from 'express';
import cors from 'cors';
import searchRoutes from './routes/searchRoutes';

const app: Express = express();
const port = 5000;

app.use(cors()); 
app.use(express.json()); 

app.use('/api/search', searchRoutes); 

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
