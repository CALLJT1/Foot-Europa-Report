// news.js

const feeds = {
    "premier-league": "https://www.bbc.co.uk/sport/football/premier-league/rss.xml",
    "la-liga": "https://www.bbc.co.uk/sport/football/spanish-la-liga/rss.xml",
    "serie-a": "https://www.bbc.co.uk/sport/football/italian-serie-a/rss.xml",
    "other-leagues": "https://www.espn.com/espn/rss/soccer/news"
};

const topStoryDiv = document.getElementById('top-story');

async function fetchRSS(feedUrl) {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data.items;
}

async function loadNews() {
    let topStorySet = false;
    for (const section in feeds) {
        const container = document.getElementById(section);
        try {
            const items = await fetchRSS(feeds[section]);
            container.innerHTML = '';
            items.slice(0, 5).forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'headline';
                div.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
                container.appendChild(div);
                
                if (!topStorySet) {
                    topStoryDiv.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
                    topStorySet = true;
                }
            });
        } catch (err) {
            container.innerHTML = 'Failed to load news.';
            console.error(`Error fetching ${section}:`, err);
        }
    }
}

// Load news on page load
loadNews();
