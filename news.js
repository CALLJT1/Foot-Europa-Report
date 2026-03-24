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
                
                // Extract image from the article
                let imageHtml = '';
                if (item.enclosure && item.enclosure.link) {
                    imageHtml = `<img src="${item.enclosure.link}" alt="${item.title}" style="width:100%; height:auto; margin-bottom:8px; border-radius:4px;">`;
                } else if (item.thumbnail) {
                    imageHtml = `<img src="${item.thumbnail}" alt="${item.title}" style="width:100%; height:auto; margin-bottom:8px; border-radius:4px;">`;
                } else if (item.description && item.description.includes('<img')) {
                    const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) {
                        imageHtml = `<img src="${imgMatch[1]}" alt="${item.title}" style="width:100%; height:auto; margin-bottom:8px; border-radius:4px;">`;
                    }
                }
                
                div.innerHTML = `
                    ${imageHtml}
                    <a href="${item.link}" target="_blank" style="font-weight:bold; text-decoration:none; color:#000;">
                        ${item.title}
                    </a>
                    <p style="font-size:0.9em; color:#666; margin-top:5px;">
                        ${item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ''}
                    </p>
                `;
                container.appendChild(div);
                
                if (!topStorySet && imageHtml) {
                    topStoryDiv.innerHTML = `
                        ${imageHtml}
                        <a href="${item.link}" target="_blank" style="font-weight:bold; text-decoration:none; color:#000;">
                            ${item.title}
                        </a>
                    `;
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
