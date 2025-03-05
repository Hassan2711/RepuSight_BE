import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export const fetchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search_type, query } = req.query;

        if (!search_type || !query) {
            res.status(400).json({ message: 'Missing required query parameters: search_type or query' });
            return;
        }

        const twitterApiUrl = process.env.TWITTER_API_URL;
        // const facebookApiUrl = process.env.FACEBOOK_API_URL;

        // if (!twitterApiUrl || !facebookApiUrl) {
        if (!twitterApiUrl) {
            res.status(500).json({ message: 'API URLs for Twitter or Facebook are not defined in .env' });
            return;
        }

        const twitterHeaders = {
            'x-rapidapi-host': 'twitter-api45.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY, 
        };

        const twitterParams = {
            query: query.toString(),
            search_type: 'People',  
        };


        // const [twitterResponse, facebookResponse] = await Promise.all([
        const [twitterResponse] = await Promise.all([
            axios.get(twitterApiUrl, { headers: twitterHeaders, params: twitterParams }),
            // axios.get(facebookApiUrl, { params: { query: query.toString() } }), 
        ]);

        const combinedData = {
            twitterUsers: twitterResponse.data,
            // facebookUsers: facebookResponse.data,
        };

        res.json(combinedData);

    } catch (error) {
        console.error('Error fetching data from external APIs:', error);
        res.status(500).json({ message: 'Failed to fetch data from external APIs' });
    }
};
