// Multi-source RSS feeds per league
const feeds = {
    "pl-news": [
        "https://feeds.bbci.co.uk/sport/football/premier-league/rss.xml",
        "https://www.goal.com/en/feeds/news?tags=premier-league",
        "https://www.skysports.com/rss/12040"
    ],
    "laliga-news": [
        "https://feeds.bbci.co.uk/sport/football/spanish-la-liga/rss.xml",
        "https://www.goal.com/en/feeds/news?tags=la-liga",
        "https://www.skysports.com/rss/12044"
    ],
    "seriea-news": [
        "https://feeds.bbci.co.uk/sport/football/italian-serie-a/rss.xml",
        "https://www.goal.com/en/feeds/news?tags=serie-a",
        "https://www.skysports.com/rss/12038"
    ],
    "bundesliga-news": [
        "https://feeds.bbci.co.uk/sport/football/german-bundesliga/rss.xml",
        "https://www.goal.com/en/feeds/news?tags=bundesliga",
        "https://www.skysports.com/rss/12042"
    ],
    "ligue1-news": [
        "https://feeds.bbci.co.uk/sport/football/french-ligue-one/rss.xml",
        "https://www.goal.com/en/feeds/news?tags=ligue-1",
        "https://www.skysports.com/rss/12045"
    ]
};

const topStoryDiv = document.getElementById('top-story');

// Fetch RSS via AllOrigins to bypass CORS
async function fetchRSS(url){
    try {
        const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const controller = new AbortController();
        const timeout = setTimeout(()=>controller.abort(),8000);

        const res = await fetch(apiUrl, {signal: controller.signal});
        clearTimeout(timeout);

        const text = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text,"text/xml");

        const items = Array.from(xml.querySelectorAll("item")).map(item => ({
            title: item.querySelector("title")?.textContent || "",
            link: item.querySelector("link")?.textContent || "#",
            description: item.querySelector("description")?.textContent || "",
            pubDate: item.querySelector("pubDate")?.textContent || "",
            enclosure: {
                link: item.querySelector("enclosure")?.getAttribute("url") || null
            },
            thumbnail: item.querySelector("media\\:thumbnail")?.getAttribute("url") || null,
            image: item.querySelector("media\\:content")?.getAttribute("url") || null
        }));

        return items;
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

    for(const section in feeds){
        const container = document.getElementById(section);
        if(!container) continue;

        const requests = feeds[section].map(url => fetchRSS(url));
        const results = await Promise.all(requests);

        let items = results.flat();
        items = items.sort((a,b)=>new Date(b.pubDate) - new Date(a.pubDate));
        items = items.slice(0,5);

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

            if(!topSet && img){
                topStoryDiv.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer"><img src="${img}" alt=""></a>
                                         <a href="${item.link}" target="_blank" rel="noopener noreferrer" style="font-weight:bold; font-size:1.3em; display:block; margin-top:5px;">${item.title}</a>`;
                topSet = true;
            }

            div.innerHTML = html;
            container.appendChild(div);
        });
    }

    if(!topSet){
        topStoryDiv.innerHTML = '<p style="color:#999;">No top story available</p>';
    }
}

window.addEventListener('load', loadNews);
