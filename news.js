const feeds = {
    "pl-news": [
        "https://www.bbc.co.uk/sport/football/premier-league/rss.xml",
        "https://www.espn.com/espn/rss/soccer/news?league=eng.1"
    ],
    "laliga-news": [
        "https://www.bbc.co.uk/sport/football/spanish-la-liga/rss.xml",
        "https://www.espn.com/espn/rss/soccer/news?league=esp.1"
    ],
    "seriea-news": [
        "https://www.bbc.co.uk/sport/football/italian-serie-a/rss.xml",
        "https://www.espn.com/espn/rss/soccer/news?league=ita.1"
    ],
    "bundesliga-news": [
        "https://www.bbc.co.uk/sport/football/german-bundesliga/rss.xml",
        "https://www.espn.com/espn/rss/soccer/news?league=ger.1"
    ],
    "ligue1-news": [
        "https://www.bbc.co.uk/sport/football/french-ligue-one/rss.xml",
        "https://www.espn.com/espn/rss/soccer/news?league=fra.1"
    ]
};

const topStoryDiv = document.getElementById('top-story');

async function fetchRSS(url){
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        return data.items || [];
    } catch(e){
        console.error("RSS fetch failed:", url, e);
        return [];
    }
}

function extractImage(description){
    if(!description) return null;
    const match = description.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : null;
}

function upgradeImage(url){
    if(!url) return null;
    if(url.includes('ichef.bbci.co.uk')) return url.replace(/\/\d+\//,'/1280/');
    if(url.includes('espn')) return url.replace(/\?.*$/,'?w=1280');
    return url;
}

// Fetch all feeds for a league, merge, filter football, sort by date
async function fetchLeagueArticles(feedArray){
    const allArticles = [];

    await Promise.all(feedArray.map(async (feed) => {
        const items = await fetchRSS(feed);
        items.forEach(item => {
            const title = item.title.toLowerCase();
            const categories = (item.categories || []).map(c => c.toLowerCase());
            if(title.includes("football") || title.includes("soccer") || categories.includes("football") || categories.includes("soccer")){
                allArticles.push(item);
            }
        });
    }));

    // Sort newest first
    allArticles.sort((a,b) => new Date(b.pubDate) - new Date(a.pubDate));

    return allArticles.slice(0,5);
}

async function loadNews(){
    let topSet = false;

    for(const section in feeds){
        const container = document.getElementById(section);
        if(!container) continue;

        container.innerHTML = '';

        const items = await fetchLeagueArticles(feeds[section]);

        if(items.length === 0){
            container.innerHTML = '<p style="color:#999;">No articles available</p>';
            continue;
        }

        items.forEach(item => {
            let img = item.enclosure?.link || item.thumbnail || item.image || extractImage(item.description);
            img = upgradeImage(img);

            const div = document.createElement('div');
            div.className='headline';

            let html = '';
            if(img){
                html += `<a href="${item.link}" target="_blank"><img src="${img}" alt=""></a>`;
            }
            html += `<a href="${item.link}" target="_blank">${item.title}</a>`;

            // Top story: first article with image
            if(!topSet && img){
                topStoryDiv.innerHTML = `<a href="${item.link}" target="_blank"><img src="${img}" alt=""></a>
                                         <a href="${item.link}" target="_blank" style="font-weight:bold; font-size:1.3em; display:block; margin-top:5px;">${item.title}</a>`;
                topSet = true;
            }

            div.innerHTML = html;
            container.appendChild(div);
        });
    }
}

window.addEventListener('load', loadNews);
