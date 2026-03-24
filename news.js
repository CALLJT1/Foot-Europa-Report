const feeds = {

"pl-news":"https://www.bbc.co.uk/sport/football/premier-league/rss.xml",
"laliga-news":"https://www.bbc.co.uk/sport/football/spanish-la-liga/rss.xml",
"seriea-news":"https://www.bbc.co.uk/sport/football/italian-serie-a/rss.xml",
"bundesliga-news":"https://www.bbc.co.uk/sport/football/german-bundesliga/rss.xml",
"ligue1-news":"https://www.bbc.co.uk/sport/football/french-ligue-one/rss.xml",
"ucl-news":"https://www.bbc.co.uk/sport/football/european-cup/rss.xml",

"transfer-news":"https://www.bbc.co.uk/sport/football/transfers/rss.xml",
"skysports-transfers":"https://www.skysports.com/transfer-news/rss.xml",
"espn-transfers":"https://www.espn.com/espn/rss/soccer/news"

};

const topStoryDiv=document.getElementById("top-story");


async function fetchRSS(url){

const api=`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

try{

const response=await fetch(api);
const text=await response.text();

const parser=new DOMParser();
const xml=parser.parseFromString(text,"text/xml");

const items=[...xml.querySelectorAll("item")].map(item=>({

title:item.querySelector("title")?.textContent,
link:item.querySelector("link")?.textContent,
pubDate:item.querySelector("pubDate")?.textContent

}));

return items;

}catch(err){

console.error(err);
return[];

}

}


async function fetchArticleImage(articleUrl){

try{

const proxy=`https://api.allorigins.win/raw?url=${encodeURIComponent(articleUrl)}`;

const response=await fetch(proxy);

const html=await response.text();

const match=html.match(/<meta property="og:image" content="([^"]+)"/);

if(match){

return match[1];

}

return null;

}catch(err){

return null;

}

}


async function loadTicker(){

const ticker=document.getElementById("ticker-content");

const items=await fetchRSS("https://www.bbc.co.uk/sport/football/rss.xml");

if(!items || items.length===0){

ticker.innerHTML="Latest football news";
return;

}

let headlines="";

items.slice(0,10).forEach(item=>{

headlines+=`<a href="${item.link}" target="_blank">${item.title}</a>`;

});

ticker.innerHTML=headlines;

}


async function loadNews(){

let topStorySet=false;

for(const section in feeds){

const container=document.getElementById(section);

if(!container)continue;

const items=await fetchRSS(feeds[section]);

container.innerHTML="";

for(let i=0;i<5;i++){

const item=items[i];

if(!item) continue;

const div=document.createElement("div");

div.className="headline";

const image=await fetchArticleImage(item.link);

let html="";

if(image){

html+=`<img src="${image}" style="margin-bottom:8px">`;

}

html+=`

<a href="${item.link}" target="_blank">
${item.title}
</a>

<p style="font-size:0.8em;color:#999">
${new Date(item.pubDate).toLocaleDateString()}
</p>

`;

div.innerHTML=html;

container.appendChild(div);

if(!topStorySet && image){

topStoryDiv.innerHTML=`

<img src="${image}" style="width:50%;display:block;margin:0 auto 15px auto">

<a href="${item.link}" target="_blank"
style="font-size:1.5em;text-decoration:none;color:#000;font-weight:bold;">
${item.title}
</a>

`;

topStorySet=true;

}

}

}

}


function showCategory(category,event){

document.getElementById("news").classList.add("hidden");
document.getElementById("transfers").classList.add("hidden");

document.getElementById(category).classList.remove("hidden");

document.querySelectorAll(".category-tabs button").forEach(btn=>{
btn.classList.remove("active");
});

event.target.classList.add("active");

}


window.addEventListener("load",()=>{

loadNews();
loadTicker();

});
