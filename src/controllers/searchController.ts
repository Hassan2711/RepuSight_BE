import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
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


export const fetchAndAnalyzeTweets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.query;
  
      if (!query) {
        res.status(400).json({ message: 'Missing required query parameter: query' });
        return;
      }
  
      const twitterApiUrl = process.env.TWITTER_API_URL;
      if (!twitterApiUrl) {
        res.status(500).json({ message: 'API URL for Twitter is not defined in .env' });
        return;
      }
  
      const twitterHeaders = {
        'x-rapidapi-host': 'twitter-api45.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY,
      };
  
      const twitterParams = {
        query: query.toString(),
        search_type: 'Latest',
      };
  
      const twitterResponse = await axios.get(twitterApiUrl, {
        headers: twitterHeaders,
        params: twitterParams,
      });
  
      const tweets = twitterResponse.data.timeline;

      const combinedTweetText = tweets
      .map((tweet: any) => tweet.text)
      .join(' ');

    // FOR ANALYZING EACH TWEET 1 BY 1    

    //   const analyzedTweets = await Promise.all(
    //     tweets.map(async (tweet: any) => {
    //       const tweetText = tweet.text;
  
    //       const openaiResponse = await openai.chat.completions.create({
    //         model: 'gpt-4',
    //         messages: [
    //           {
    //             role: 'system',
    //             content: 'You will be provided with a tweet, and your task is to classify its sentiment as positive, neutral, or negative. Rate the sentiment on a scale of 1 to 5 stars, with 5 being the most positive and 1 being the most negative. Additionally, provide a paragraph explaining the sentiment and highlighting the reasons that contribute to the sentiment.',
    //           },
    //           {
    //             role: 'user',
    //             content: tweetText,
    //           },
    //         ],
    //         temperature: 1,
    //         max_tokens: 256,
    //         top_p: 1,
    //       });
  
    //       return {
    //         tweet: tweetText,
    //         sentiment: openaiResponse.choices[0].message.content,
    //       };
    //     })
    //   );
  
    //   res.json({ analyzedTweets });

    const openaiResponse = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
             'You will be provided with a collection of tweets. Your task is to classify the overall sentiment as positive, neutral, or negative. Rate the sentiment on a scale of 1 to 5 stars, with 5 being the most positive and 1 being the most negative. Additionally, provide a collective explanation of the sentiment expressed in the tweets, highlight the reasons that contribute to the overall sentiment, and provide tips on improving the sentiment. Return the response as a JSON object with the following keys: "rating", "sentiment", "reasoning", and "tips_on_improving_sentiment".',
          },
          {
            role: 'user',
            content: combinedTweetText,
          },
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
      });
  
      const jsonResponse = openaiResponse.choices[0].message.content;


    if (typeof jsonResponse === 'string') {
        const structuredAnalysis = JSON.parse(jsonResponse);
        res.json(structuredAnalysis);
    } else {
        res.status(500).json({ message: 'Invalid response format from OpenAI API' });
    }
  
  
    } catch (error) {
      console.error('Error fetching data from external APIs:', error);
      res.status(500).json({ message: 'Failed to fetch data from external APIs' });
    }
  };