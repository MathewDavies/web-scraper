// routes.js
import express from 'express';
import { scrapeRightmove } from './scraper.mjs';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const properties = await scrapeRightmove(req.body);
        res.json({
            message: 'successful operation.',
            data: properties,
        });
    } catch (error) {
        res.status(500).send('An error occurred while scraping the page.');
    }
});

export default router;
