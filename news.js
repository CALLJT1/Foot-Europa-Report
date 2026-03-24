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

async function fetchRSS(feedUrl){

const api=`https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;

try{

const response=await fetch(api);
const data=await response.json();

const parser=new DOMParser();
const xml=parser.parseFromString(data.contents,"text/xml");

const items=[...xml.querySelectorAll("item")].map(item=>({

title:item.querySelector("title")?.textContent,
link:item.querySelector("link")?.textContent,
pubDate:item.querySelector("pubDate")?.textContent,
description:item.querySelector("description")?.textContent

}));

return items;

}catch(err){

console.error(err);
return[];

}

}

function extractImage(description){

if(!description)return null;

const match=description.match(/<img[^>]+src="([^">]+)"/);

return match?match[1]:null;

}

async function loadNews(){

let topStorySet=false;

for(const section in feeds){

const container=document.getElementById(section);

if(!container)continue;

const items=await fetchRSS(feeds[section]);

container.innerHTML="";

if(items.length===0){

container.innerHTML="<p>No articles available</p>";
continue;

}

items.slice(0,5).forEach(item=>{

const div=document.createElement("div");

div.className="headline";

let image=extractImage(item.description);

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

<p>
<a href="${item.link}" target="_blank" style="
background:#0066cc;
color:#fff;
padding:6px 12px;
text-decoration:none;
border-radius:4px;
font-size:0.8em;">
Follow your club
</a>
</p>

`;

div.innerHTML=html;

container.appendChild(div);

if(!topStorySet && image){

topStoryDiv.innerHTML=`

<img src="${image}" style="width:50%;display:block;margin:0 auto 15px auto;border-radius:4px">

<a href="${item.link}" target="_blank" style="font-size:1.5em;text-decoration:none;color:#000;font-weight:bold;">
${item.title}
</a>

<p style="margin-top:10px;">
<a href="${item.link}" target="_blank" style="
background:#0066cc;
color:#fff;
padding:10px 20px;
text-decoration:none;
border-radius:4px;">
Follow your club
</a>
</p>

`;

topStorySet=true;

}

});

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

window.addEventListener("load",loadNews);
