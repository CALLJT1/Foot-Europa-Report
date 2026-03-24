// news.js

// Function to fetch RSS feeds from various soccer leagues
async function fetchRSSFeeds() {
    const leagues = {
        "Premier League": "https://www.premierleague.com/en-gb/news/rss",
        "La Liga": "https://www.laliga.com/en/feeds/news",
        "Serie A": "https://www.legaseriea.it/en/rss",
        // add more leagues as needed
    };

    const feedPromises = Object.keys(leagues).map(async (league) => {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(leagues[league])}&api_key=YOUR_API_KEY`);
        const data = await response.json();
        return { league, articles: data.items };
    });

    return Promise.all(feedPromises);
}

// Function to dynamically populate HTML with fetched feeds
function populateFeeds(feeds) {
    const container = document.getElementById('rss-feeds');
    container.innerHTML = ''; // Clear previous feeds

    feeds.forEach(feed => {
        const leagueSection = document.createElement('section');
        leagueSection.innerHTML = `<h2>${feed.league}</h2>`;
        
        feed.articles.forEach(article => {
            const articleLink = document.createElement('a');
            articleLink.href = article.link;
            articleLink.target = '_blank';
            articleLink.innerText = article.title;

            leagueSection.appendChild(articleLink);
            leagueSection.appendChild(document.createElement('br'));
        });

        container.appendChild(leagueSection);
    });
}

// Fetch and populate feeds on page load
window.onload = async () => {
    const feeds = await fetchRSSFeeds();
    populateFeeds(feeds);
};
