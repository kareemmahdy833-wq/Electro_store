const ICO='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="16" y="16" width="32" height="32" rx="4" fill="#173e73"/><g stroke="#2f6fd0" stroke-width="3"><path d="M24 8v8M32 8v8M40 8v8M24 48v8M32 48v8M40 48v8M8 24h8M8 32h8M8 40h8M48 24h8M48 32h8M48 40h8"/></g></svg>');
let cat="",cart=JSON.parse(sessionStorage.getItem("c")||"{}");
const im=(s,cl)=>`<img src="${s}" alt="" loading="lazy" onerror="this.onerror=null;this.src='${ICO}'">`;
function render(){const q=document.getElementById("q").value.toLowerCase();
grid.innerHTML=P.map((p,i)=>({p,i})).filter(({p})=>(!cat||p.c===cat)&&(p.n+p.s+p.c).toLowerCase().includes(q)).map(({p,i})=>`
<div class="card"><div class="im">${im(p.img)}</div><h3>${p.n}${p.pop?' <span style="color:var(--b);font-size:11px">★ Popular</span>':''}</h3><small>${p.s}</small>
${p.sel?`<select id="o${i}">${O[p.sel].map(o=>`<option>${o}</option>`).join("")}</select>`:""}
<div class="price">${price(p)} EGP</div><button onclick="add(${i})">🛒 Add to Cart</button></div>`).join("")||"<p>No products found.</p>";}
cats.innerHTML=C.map(c=>`<div class="cat" onclick="pick('${c}')">${im("images/cat-"+c.split(" ")[0].toLowerCase()+".jpg")}<br>${c}</div>`).join("");
fcats.innerHTML=C.slice(0,6).map(c=>`<a onclick="pick('${c}')">${c}</a>`).join("");
function pick(c){cat=cat===c?"":c;document.querySelectorAll(".cat").forEach(e=>e.classList.toggle("on",e.textContent.trim()===cat));render();go("shop")}
function go(id){document.getElementById(id).scrollIntoView({behavior:"smooth"})}
function tog(){document.getElementById("cart").classList.toggle("open");drawCart()}
function add(i){const p=P[i],o=document.getElementById("o"+i),k=p.n+(o?" ("+o.value+")":"");
const m=p.sel==="meters"?parseFloat(o.value):1;cart[k]=cart[k]||{q:0,pr:price(p)*m};cart[k].q++;save();tog2()}
function tog2(){document.getElementById("cart").classList.add("open");drawCart()}
function chg(k,d){cart[k].q+=d;if(cart[k].q<=0)delete cart[k];save();drawCart()}
function save(){sessionStorage.setItem("c",JSON.stringify(cart));cnt.textContent=Object.values(cart).reduce((a,b)=>a+b.q,0)}
function drawCart(){const e=Object.entries(cart);
items.innerHTML=e.map(([k,v])=>`<div class="row"><span style="flex:1">${k}</span><button onclick="chg(this.dataset.k,-1)" data-k="${k}">−</button>${v.q}<button onclick="chg(this.dataset.k,1)" data-k="${k}">+</button><b>${v.q*v.pr}</b></div>`).join("")||"<p>Cart is empty</p>";
tot.textContent="Total: "+e.reduce((a,[k,v])=>a+v.q*v.pr,0)+" EGP (no shipping)"}
function order(){const e=Object.entries(cart);if(!e.length)return;
let m="*ElectroStore order*\n"+e.map(([k,v])=>`• ${k} x${v.q} = ${v.q*v.pr} EGP`).join("\n")+"\n"+tot.textContent+"\nName: "+nm.value+"\nInfo: "+ph.value;
open("https://wa.me/"+WA+"?text="+encodeURIComponent(m))}
render();save();
