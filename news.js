const feeds = {
    // News Feeds
    "pl-news": "https://www.bbc.co.uk/sport/football/premier-league/rss.xml",
    "laliga-news": "https://www.bbc.co.uk/sport/football/spanish-la-liga/rss.xml",
    "seriea-news": "https://www.bbc.co.uk/sport/football/italian-serie-a/rss.xml",
    "bundesliga-news": "https://www.bbc.co.uk/sport/football/german-bundesliga/rss.xml",
    "ligue1-news": "https://www.bbc.co.uk/sport/football/french-ligue-one/rss.xml",
    "ucl-news": "https://www.bbc.co.uk/sport/football/european-cup/rss.xml",

    // Transfer Feeds
    "transfer-news": "https://www.bbc.co.uk/sport/football/transfers/rss.xml",
    "skysports-transfers": "https://www.skysports.com/transfer-news/rss.xml",
    "espn-transfers": "https://www.espn.com/espn/rss/soccer/news"
};

const topStoryDiv = document.getElementById('top-story');

async function fetchRSS(url){
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        return data.items || [];
    } catch(e){
        console.error(e);
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

async function loadNews(){
    let topSet = false;
    for(const section in feeds){
        const container = document.getElementById(section);
        if(!container) continue;

        const items = await fetchRSS(feeds[section]);
        container.innerHTML = '';
        if(items.length===0){
            container.innerHTML = '<p style="color:#999;">No articles available</p>';
            continue;
        }

        items.slice(0,5).forEach(item=>{
            let img = item.enclosure?.link || item.thumbnail || item.image || extractImage(item.description);
            img = upgradeImage(img);

            const div = document.createElement('div');
            div.className='headline';

            let html = '';
            if(img){
                html += `<a href="${item.link}" target="_blank"><img src="${img}" alt=""></a>`;
            }
            html += `<a href="${item.link}" target="_blank">${item.title}</a>`;

            div.innerHTML = html;
            container.appendChild(div);

            // Set top story only once
            if(!topSet && img){
                topStoryDiv.innerHTML = `<a href="${item.link}" target="_blank"><img src="${img}" alt=""></a>
                                         <a href="${item.link}" target="_blank" style="font-weight:bold; font-size:1.5em; display:block; margin-top:5px;">${item.title}</a>`;
                topSet = true;
            }
        });
    }
}

window.addEventListener('load', loadNews);
