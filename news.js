// news.js

// Mapping of section IDs to RSS feed URLs
const feeds = {
    "pl-news": "https://www.bbc.co.uk/sport/football/premier-league/rss.xml",
    "laliga-news": "https://www.bbc.co.uk/sport/football/spanish-la-liga/rss.xml",
    "seriea-news": "https://www.bbc.co.uk/sport/football/italian-serie-a/rss.xml",
    "bundesliga-news": "https://www.bbc.co.uk/sport/football/german-bundesliga/rss.xml",
    "ligue1-news": "https://www.bbc.co.uk/sport/football/french-ligue-one/rss.xml",
    "ucl-news": "https://www.uefa.com/rssfeed/news/rss.xml", // UEFA Champions League
    "transfer-news": "https://www.transfermarkt.com/rss/news", // general transfer news
    "skysports-transfers": "https://www.skysports.com/feeds/11095/transfer-news", 
    "espn-transfers": "https://www.espn.com/espn/rss/soccer/news"
};

// Utility function to fetch RSS via rss2json.com
async function fetchRSS(feedUrl) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.items;
    } catch (err) {
        console.error(`Error fetching feed ${feedUrl}:`, err);
        return [];
    }
}

// Load top story (first headline from Premier League)
async function loadTopStory() {
    const topStoryDiv = document.getElementById("top-story");
    const items = await fetchRSS(feeds["pl-news"]);
    if (items.length > 0) {
        topStoryDiv.innerHTML = `<a href="${items[0].link}" target="_blank">${items[0].title}</a>`;
    } else {
        topStoryDiv.innerHTML = "No top story available.";
    }
}

// Load news for a section
async function loadSection(sectionId) {
    const container = document.getElementById(sectionId);
    const items = await fetchRSS(feeds[sectionId]);
    container.innerHTML = "";
    if (items.length === 0) {
        container.innerHTML = "Failed to load news.";
        return;
    }
    items.slice(0, 5).forEach(item => {
        const div = document.createElement("div");
        div.className = "headline";
        div.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
        container.appendChild(div);
    });
}

// Load all sections
async function loadAllNews() {
    await loadTopStory();
    for (const sectionId in feeds) {
        await loadSection(sectionId);
    }
}

// Initialize everything on page load
document.addEventListener("DOMContentLoaded", () => {
    loadAllNews();
});
