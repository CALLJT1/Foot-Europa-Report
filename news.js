// Multi-source RSS feeds per league
const feeds = {
    "pl-news": [
        "https://www.bbc.co.uk/sport/football/premier-league/rss.xml",
        "https://www.espn.com/espn/rss/premiership/news",
        "https://www.goal.com/en/feeds/en/news?fmt=rss&tags=premier-league"
    ],
    "laliga-news": [
        "https://www.bbc.co.uk/sport/football/spanish-la-liga/rss.xml",
        "https://www.espn.com/espn/rss/laliga/news",
        "https://www.goal.com/en/feeds/en/news?fmt=rss&tags=la-liga"
    ],
    "seriea-news": [
        "https://www.bbc.co.uk/sport/football/italian-serie-a/rss.xml",
        "https://www.espn.com/espn/rss/seriea/news",
        "https://www.goal.com/en/feeds/en/news?fmt=rss&tags=serie-a"
    ],
    "bundesliga-news": [
        "https://www.bbc.co.uk/sport/football/german-bundesliga/rss.xml",
        "https://www.espn.com/espn/rss/bundesliga/news",
        "https://www.goal.com/en/feeds/en/news?fmt=rss&tags=bundesliga"
    ],
    "ligue1-news": [
        "https://www.bbc.co.uk/sport/football/french-ligue-one/rss.xml",
        "https://www.espn.com/espn/rss/ligue1/news",
        "https://www.goal.com/en/feeds/en/news?fmt=rss&tags=ligue-1"
    ]
};

const topStoryDiv = document.getElementById('top-story');

// Fetch RSS using rss2json API
async function fetchRSS(url){
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    try {
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(),8000);
        const res = await fetch(apiUrl,{signal:controller.signal});
        clearTimeout(timeout);
        const data = await res.json();
        return data.items || [];
    } catch(e){
        console.error(`Failed to fetch ${url}`, e);
        return [];
    }
}

// Extract image from description if needed
function extractImage(description){
    if(!description) return null;
    const match = description.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
}

// Upgrade image quality if BBC/ESPN
function upgradeImage(url){
    if(!url) return null;
    if(url.includes('ichef.bbci.co.uk')) return url.replace(/\/\d+\//,'/1280/');
    if(url.includes('espn')) return url.replace(/\?.*$/,'?w=1280');
    return url;
}

// Load all news
async function loadNews(){
    let topSet = false;

    // Loop through all leagues
    for(const section in feeds){
        const container = document.getElementById(section);
        if(!container) continue;

        // Fetch all feeds in parallel
        const requests = feeds[section].map(url => fetchRSS(url));
        const results = await Promise.all(requests);

        // Combine all items and sort by pubDate
        let items = results.flat();
        items = items.sort((a,b)=>new Date(b.pubDate) - new Date(a.pubDate));
        items = items.slice(0,5); // top 5 articles

        container.innerHTML = '';
        if(items.length === 0){
            container.innerHTML = '<p style="color:#999;">No articles available</p>';
            continue;
        }

        items.forEach(item=>{
            let img = upgradeImage(
                item.enclosure?.link ||
                item.thumbnail ||
                item.image ||
                extractImage(item.description)
            );

            const div = document.createElement('div');
            div.className='headline';

            let html = '';
            if(img){
                html += `<a href="${item.link}" target="_blank" rel="noopener noreferrer"><img src="${img}" loading="lazy" alt=""></a>`;
            }
            html += `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>`;

            // Set top story once
            if(!topSet && img){
                topStoryDiv.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer"><img src="${img}" alt=""></a>
                                         <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="font-weight:bold; font-size:1.3em; display:block; margin-top:5px;">${item.title}</a>`;
                topSet = true;
            }

            div.innerHTML = html;
            container.appendChild(div);
        });
    }

    // Fallback if no top story
    if(!topSet){
        topStoryDiv.innerHTML = '<p style="color:#999;">No top story available</p>';
    }
}

window.addEventListener('load', loadNews);
