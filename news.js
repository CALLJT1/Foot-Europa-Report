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

const api=`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;

try{

const response=await fetch(api);
const data=await response.json();
return data.items || [];

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

function upgradeImage(image){

if(!image)return null;

if(image.includes("ichef.bbci.co.uk")){
return image.replace(/\/\d+\//,"/1280/");
}

return image;

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

let image=null;

if(item.thumbnail)image=item.thumbnail;
else if(item.enclosure && item.enclosure.link)image=item.enclosure.link;
else if(item.description)image=extractImage(item.description);

image=upgradeImage(image);

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

<img src="${image}" style="width:50%;margin-bottom:15px;border-radius:4px">

<br>

<a href="${item.link}" target="_blank" style="font-size:1.4em;text-decoration:none;color:#000;font-weight:bold;">
${item.title}
</a>

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
