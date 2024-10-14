// scraper.js
import puppeteer from 'puppeteer';
import { delay } from './utlils.mjs';


export const scrapeRightmove = async ({ location, radius, minPrice, maxPrice, minBedrooms, maxBedrooms, propertyTypes, maxDaysSinceAdded }) => {
    console.log('Starting scraping with parameters:', { location, radius, minPrice, maxPrice, minBedrooms, maxBedrooms, propertyTypes, maxDaysSinceAdded });
    let browser;
    
    try {
        // Launch the browser
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36");

        await page.goto('https://www.rightmove.co.uk/');
        await page.setViewport({ width: 1080, height: 1024 });

        // Cookie consent handling
        await page.waitForSelector('#onetrust-banner-sdk', { visible: true, timeout: 10000 });
        const rejectButton = await page.$('#onetrust-reject-all-handler');
        if (rejectButton) {
            await rejectButton.click();
            await page.waitForSelector('#onetrust-banner-sdk', { hidden: true, timeout: 10000 });
        } else {
            console.log('"Reject All" button not found.');
        }

        // Location Search
        await page.waitForSelector('#ta_searchInput', { visible: true });
        await page.type('#ta_searchInput', location);
        await delay(2000);

        // Click "For Sale" Button
        const forSaleButton = await page.$('[data-testid="forSaleCta"]');
        if (forSaleButton) {
            await forSaleButton.click();
            console.log('For sale button clicked.');
        }

        await delay(2000);

        // Set search options (radius, price, bedrooms, etc.)
        await page.waitForSelector('#radius', { visible: true });
        await page.select('#radius', radius);
        await page.select('#minPrice', minPrice);
        await page.select('#maxPrice', maxPrice);
        await page.select('#minBedrooms', minBedrooms);
        await page.select('#maxBedrooms', maxBedrooms);
        await page.select('#propertyTypes', propertyTypes);
        await page.select('#maxDaysSinceAdded', maxDaysSinceAdded);
        
        await page.click('#submit');
        await delay(2000);

        let allProperties = [];
        let hasNextPage = true;

        // Pagination handling
        while (hasNextPage) {
            const data = await page.evaluate(() => {
                const propertyCards = document.querySelectorAll('.propertyCard');
                return [...propertyCards].map(card => {
                    // Extract property name
                    const propertyName = card.querySelector('.propertyCard-address')?.innerText.trim() || 'N/A';

                    // Extract price
                    const price = card.querySelector('.propertyCard-priceValue')?.innerText.trim().replace(/[^\d]/g, '') || 'N/A';

                    // Extract property type
                    const type = card.querySelector('.property-information span:nth-child(1)')?.innerText.trim() || 'N/A';

                    // Extract number of bedrooms
                    const bedrooms = card.querySelector('.property-information span:nth-child(3)')?.innerText.trim() || 'N/A';

                    // Extract number of bathrooms
                    const bathrooms = card.querySelector('.property-information span:nth-child(5)')?.innerText.trim() || 'N/A';

                    // Extract property link
                    const propertyLink = card.querySelector('a.propertyCard-link') ? 'https://www.rightmove.co.uk' + card.querySelector('a.propertyCard-link').getAttribute('href') : 'N/A';

                    return { propertyName, price, type, bedrooms, bathrooms, propertyLink };
                });
            });

            allProperties = allProperties.concat(data);

            const nextButton = await page.$('[data-test="pagination-next"]');
            if (nextButton) {
                const isDisabled = await page.evaluate(button => button.hasAttribute('disabled'), nextButton);
                if (isDisabled) {
                    hasNextPage = false;
                } else {
                    await nextButton.click();
                    await delay(5000);
                }
            } else {
                hasNextPage = false;
            }
        }

        const uniqueProperties = Array.from(new Map(allProperties.map(item => [item.propertyName + item.price, item])).values());
        return uniqueProperties;

    } catch (error) {
        console.error('Error scraping the page:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
