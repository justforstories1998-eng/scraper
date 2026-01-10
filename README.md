# webMethods Scraper Application

This is a full-stack web scraping application designed to aggregate information about "webMethods" (an integration platform by Software AG) from across the internet. It collects and displays various content types including news articles, job postings, blog posts, and other related information.

The application is built with a modern tech stack:
-   **Frontend**: React.js with Vite
-   **Backend**: Node.js with Express.js
-   **Database**: MongoDB (local or MongoDB Atlas)

## Features

-   **Multi-Source Scraping**: Collects webMethods-related content from various news sites, job boards (LinkedIn, Indeed), and blogs (Software AG Blog, Medium).
-   **Content Types**: Aggregates news articles, job postings, blog posts, general articles, documentation, tutorials, and videos.
-   **Robust Scraping Logic**:
    -   User-Agent rotation to mimic real browsers.
    -   Rate limiting and concurrency control to avoid overwhelming target servers.
    -   Robots.txt compliance to respect website rules.
    -   Retry mechanisms with exponential backoff for network resilience.
    -   Supports both static (Axios/Cheerio) and dynamic (Puppeteer) content scraping.
    -   Keyword-based filtering for relevance.
-   **Data Persistence**: Stores scraped content and scraping logs in MongoDB.
-   **Deduplication**: Ensures unique content entries using content hashing.
-   **Content Management**: Pagination, filtering, sorting, and full-text search capabilities for aggregated content.
-   **Admin Tools**:
    -   Dashboard for overall scraping and content statistics.
    -   Manual triggering and stopping of scraping operations (all or specific scrapers).
    -   Detailed scraping logs with search, filter, and view options.
    -   Raw server log file viewer for diagnostics.
    -   Automatic content cleanup (TTL index).
-   **Modern Frontend**:
    -   Responsive UI built with React and Tailwind CSS.
    -   Global state management with React Context.
    -   Dark mode support.
    -   Interactive charts for data visualization (Recharts).
    -   Toast notifications for user feedback.

## Tech Stack

-   **Frontend**: React.js, Vite, Tailwind CSS, Axios, React Router, Recharts, Lucide React (icons), Date-fns
-   **Backend**: Node.js, Express.js, MongoDB (Mongoose ODM), Dotenv, Axios, Cheerio, Puppeteer, Node-cron, Winston (logging), Express-rate-limit, Helmet, Robots-parser
-   **Database**: MongoDB

## Setup and Installation

Follow these steps to get the application up and running on your local machine.

### 1. Clone the Repository (or create structure as instructed by AI)

If you have this README as a file, you've likely already created the folder structure. Otherwise, you'd typically clone a Git repository. For this setup, we assume you've used the PowerShell commands to create the `webmethods-scraper` directory and its subfolders.

```bash
# If you used the PowerShell commands, you are already in the correct directory.
# Otherwise, navigate to the webmethods-scraper directory:
cd webmethods-scraper