import "@fortawesome/fontawesome-free/css/all.min.css";
import "@fortawesome/fontawesome-free/js/all.js";

document.addEventListener("DOMContentLoaded", () => {
    const mainHeader = document.getElementById("main-header");
    const categoryHeader = document.getElementById("category-header");
    const categoryContainer = document.getElementById("category-container");
    const closeBtn = document.getElementById("close-btn");
    const headerContainer = document.getElementById("explore-header");
    const categoryRow = document.getElementById("categoryRow");
    categoryRow.innerHTML = Object.keys(categories).map(category => `
    <div class="col-md-3 col-sm-6">
            <div class="category-card" data-category="${category}">
                <i class="category-icon bi ${categories[category]}"></i>
                <h5 class="mt-2">${category}</h5>
            </div>
        </div>`).join("");
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach(card => {
        card.addEventListener("click", () => {
            const category = card.getAttribute("data-category");

            // Animate header fade out
            // Animate header fade out
            gsap.to(mainHeader, {
                opacity: 0, y: -10, duration: 0.5, onComplete: () => {
                    mainHeader.classList.add("d-none");
                    categoryHeader.textContent = category;
                    categoryContainer.classList.remove("d-none");
                    closeBtn.classList.remove("d-none");

                    // Animate category fade in
                    gsap.fromTo(categoryContainer, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
                    if (window.getComputedStyle(closeBtn).opacity < 1) {
                        gsap.fromTo(closeBtn, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.3 });
                    }

                    // Move header container down
                    gsap.to(headerContainer, { top: "35vh", duration: 0.5 });
                }
            });
        });
    });

    closeBtn.addEventListener("click", () => {
        // Animate category fade out
        gsap.to(categoryContainer, {
            opacity: 0, y: -10, duration: 0.5, onComplete: () => {
                categoryContainer.classList.add("d-none");
                closeBtn.classList.add("d-none");
                mainHeader.classList.remove("d-none");

                // Animate main header fade in
                gsap.fromTo(mainHeader, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });

                // Move header container back up
                gsap.to(headerContainer, { top: "25vh", duration: 0.5 });
            }
        });
    });
});
const categories = {
    "fiction": "bi-journal-bookmark",
    "poetry": "bi-feather",
    "screenwriting": "bi-film",
    "networking": "bi-briefcase",
    "support": "bi-person-raised-hand",
    "crime": "bi-shield-lock",
    "rpg writing": "bi-dice-5",
    "game writing": "bi-controller",
    "romance": "bi-heart-fill",
    "writing prompts": "bi-lightbulb",
    "short stories": "bi-stickies",
    "myth": "bi-columns-gap",
    "fanfiction": "bi-stars",
    "historical": "bi-hourglass",
    "scholarly": "bi-mortarboard"
};

