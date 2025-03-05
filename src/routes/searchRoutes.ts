import express from 'express';
import { fetchUsers } from '../controllers/searchController';

const router = express.Router();

router.get('/fetch-users', fetchUsers);

export default router;
