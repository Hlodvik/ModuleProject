import"./main-chunk.js";import"./firebase-chunk.js";import"https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";document.addEventListener("DOMContentLoaded",(()=>{const e=document.getElementById("main-header"),o=document.getElementById("category-header"),i=document.getElementById("category-container"),a=document.getElementById("close-btn"),n=document.getElementById("explore-header");document.getElementById("categoryRow").innerHTML=Object.keys(t).map((e=>`\n    <div class="col-md-3 col-sm-6">\n            <div class="category-card" data-category="${e}">\n                <i class="category-icon bi ${t[e]}"></i>\n                <h5 class="mt-2">${e}</h5>\n            </div>\n        </div>`)).join("");document.querySelectorAll(".category-card").forEach((t=>{t.addEventListener("click",(()=>{const r=t.getAttribute("data-category");gsap.to(e,{opacity:0,y:-10,duration:.5,onComplete:()=>{e.classList.add("d-none"),o.textContent=r,i.classList.remove("d-none"),a.classList.remove("d-none"),gsap.fromTo(i,{opacity:0,y:10},{opacity:1,y:0,duration:.5}),window.getComputedStyle(a).opacity<1&&gsap.fromTo(a,{opacity:0},{opacity:1,duration:.3,delay:.3}),gsap.to(n,{top:"35vh",duration:.5})}})}))})),a.addEventListener("click",(()=>{gsap.to(i,{opacity:0,y:-10,duration:.5,onComplete:()=>{i.classList.add("d-none"),a.classList.add("d-none"),e.classList.remove("d-none"),gsap.fromTo(e,{opacity:0,y:10},{opacity:1,y:0,duration:.5}),gsap.to(n,{top:"25vh",duration:.5})}})}))}));const t={fiction:"bi-journal-bookmark",poetry:"bi-feather",screenwriting:"bi-film",networking:"bi-briefcase",support:"bi-person-raised-hand",crime:"bi-shield-lock","rpg writing":"bi-dice-5","game writing":"bi-controller",romance:"bi-heart-fill","writing prompts":"bi-lightbulb","short stories":"bi-stickies",myth:"bi-columns-gap",fanfiction:"bi-stars",historical:"bi-hourglass",scholarly:"bi-mortarboard"};
