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
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.items || [];
    } catch (err) {
        console.error('Error fetching RSS:', err);
        return [];
    }
}

function extractImageFromDescription(description) {
    if (!description) return null;
    const imgMatch = description.match(/<img[^>]+src="([^">]+)"/);
    return imgMatch ? imgMatch[1] : null;
}

function upgradeImageQuality(imageUrl) {
    if (!imageUrl) return null;
    
    // Upgrade BBC images from low to high resolution
    if (imageUrl.includes('ichef.bbci.co.uk')) {
        // Replace any resolution size with 1280 (highest available)
        imageUrl = imageUrl.replace(/\/\d+\//, '/1280/');
        return imageUrl;
    }
    
    // Upgrade ESPN images
    if (imageUrl.includes('espn')) {
        return imageUrl.replace(/\?.*$/, '?w=1280');
    }
    
    return imageUrl;
}
    
    // Upgrade BBC images from low to high resolution
    if (imageUrl.includes('ichef.bbci.co.uk')) {
        // Replace /240/ with /976/ for high resolution
        return imageUrl.replace(/\/240\//, '/976/');
    }
    
    return imageUrl;
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
                div.style.marginBottom = '15px';
                div.style.paddingBottom = '15px';
                div.style.borderBottom = '1px solid #ddd';
                
                // Try multiple ways to get image
                let imageUrl = null;
                
                if (item.enclosure && item.enclosure.link) {
                    imageUrl = item.enclosure.link;
                } else if (item.thumbnail) {
                    imageUrl = item.thumbnail;
                } else if (item.image) {
                    imageUrl = item.image;
                } else if (item.description) {
                    imageUrl = extractImageFromDescription(item.description);
                }
                
               function upgradeImageQuality(imageUrl) {
    if (!imageUrl) return null;
    
    // Upgrade BBC images from low to high resolution
    if (imageUrl.includes('ichef.bbci.co.uk')) {
        // Replace any resolution size with 1280 (highest available)
        imageUrl = imageUrl.replace(/\/\d+\//, '/1280/');
        return imageUrl;
    }
    
    // Upgrade ESPN images
    if (imageUrl.includes('espn')) {
        return imageUrl.replace(/\?.*$/, '?w=1280');
    }
    
    return imageUrl;
}
                
                // Build HTML
                let html = '';
                
                if (imageUrl) {
                    html += `<img src="${imageUrl}" alt="${item.title}" style="width:100%; height:auto; margin-bottom:10px; border-radius:4px; object-fit:cover;" onerror="this.style.display='none'">`;
                }
                
                html += `
                    <a href="${item.link}" target="_blank" style="font-weight:bold; text-decoration:none; color:#000; display:block;">
                        ${item.title}
                    </a>
                    <p style="font-size:0.85em; color:#999; margin-top:5px; margin-bottom:0;">
                        ${item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recent'}
                    </p>
                `;
                
                div.innerHTML = html;
                container.appendChild(div);
                
                // Set top story
                if (!topStorySet && imageUrl) {
                    topStoryDiv.innerHTML = `
                        <img src="${imageUrl}" alt="${item.title}" style="width:100%; height:auto; margin-bottom:15px; border-radius:4px; object-fit:cover;" onerror="this.style.display='none'">
                        <a href="${item.link}" target="_blank" style="font-weight:bold; text-decoration:none; color:#000; font-size:1.5em;">
                            ${item.title}
                        </a>
                    `;
                    topStorySet = true;
                }
            });
        } catch (err) {
            container.innerHTML = '<p style="color:#cc0000;">Failed to load news</p>';
            console.error(`Error fetching ${section}:`, err);
        }
    }
}

// Load news when page loads
window.addEventListener('load', loadNews);
loadNews();
