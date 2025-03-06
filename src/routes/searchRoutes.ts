import express from 'express';
import { fetchUsers, fetchAndAnalyzeTweets } from '../controllers/searchController';

const router = express.Router();

router.get('/fetch-users', fetchUsers);
router.get('/fetch-analyze-tweets', fetchAndAnalyzeTweets);

export default router;
