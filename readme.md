# RightMove Data to Excel

## What does it do?

This application allows you to input search criteria and then get search results from the popular UK Website Rightmove. It provides a summary of property prices, an table of all properties and an option to download a CSV file (to save as a spreadsheet). This was inspired by a request from a Property Investor who wanted to know the average property prices for properties in his area, based on certain criteria. 

## Tech Stack

The back end is done with Node using the headless browser library 'Puppeteer', with the front end done in plain HTML, CSS and Javascript. 

## A note about using Live Server in VS Code

There is a problem when using Live Server in VS Code to host the client side. Live server reloads the page involuntarily straight after the API response. I have found a patch round this by intercepting the page load and cancelling it, but I haven't included this as it distrupts the user experience. For local testing I recommend using http-server instead.

## Web Scraping and legality

This code is a form of web scraping, which, when done in huge quantities, is rightly frowned upon. Web scraping can involve searching the whole of a website, often multiple times a day, which puts strain on the servers of the scraped site. Often times, people use scraping to create content for themselves, which can effectively 'steal' customers from the original site. Finally scrapers will often profit from becoming a middle man between the original site and the customer, which could be argued, has no benefit to society. 

In most juristictions, web scraping of publicly available data is legal, although copyright can apply to some aspects. In this case we are taking publicly available factual information so copyright does not apply.

Rightmove does forbid web scraping in their terms and conditions, but it is questionable as to whether this has any legal standing, as these conditions aren't explicitly agreed to. For our purposes, where we might run this query on occasion for personal use, we are unlikely to fall foul of either the spirit or the letter of the law.

## Detecting Headless Browsers and Anti Bot measures

Large Websites such as Rightmove will often take active steps to stop people from scraping their data. This involves detecting bots and scrapers and banning their IP addresses or blocking requests. 

For a site like Rightmove, the balance is to fend off scrapers and bots without banning enthusiastic real users. We are using Puppeteer to scrape the search results, which is a headless browser, which will mimic a real user but it cannot do this perfectly.

Websites can often detect headless browsers by analysing movements patterns, typing rates and other behaviours that betray a non-human element, or they can check for certain features Javascript features that only a browser will have. There may also be a rate limit for requests with too many leading to banning or blacklisting. 

After a thoroughly depressing few paragraphs, I should put this into context. 

The type of scraping that would keep Rightmove executive up at night would involve someone constantly searching Rightmove's search results for hundreds of locations a day. Imagine for example, that we retooled this scraper to search an array of the 1400 or so towns and cities in the UK with a population of over 10,000 people and to write this data to a JSON file in a loop. If I ran this all day I could end up with thousands or tens of thousands of requests to the Rightmove server. 

This is the kind of stuff that is realistically going to provoke a response, not us figuring out the average property price in our local town. During development I have used this over 100 times in a day and been fine.

## Other resources

An informative video on the legalities of web scraping: <https://www.youtube.com/watch?v=8GhFmQPZAlo>

## The fragility of scrapers

This code selects fields based on IDs and class names. If Rightmove decides to change its class names, IDs or format, then this scraper will break. There is not much we can do about this, other than wait until it happens and adjust the code accordingly. 

## What could be improved?

I am pretty happy with the code, although given infinite time, there are plenty of things I could do:

- More error handling with puppeteer
- Rotate the User Agent to make IP Banning less likely
- Separate things into smaller functions for easier organisation
- Better error handling on the client side, as a failure on the server side can lead to the spinner staying there forever
- Improve the UI a little bit





