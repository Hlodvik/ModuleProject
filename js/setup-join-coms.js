import { db } from "./auth.js";
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

// Define category mappings
const categoryTags = {
    fiction: ["fiction", "short stories", "fanfiction", "myth", "folklore", "horror", "paranormal", "worldbuilding", "fantasy"],
    poetry: ["poetry", "spoken word"],
    screenwriting: ["screenwriting", "scripts"],
    networking: ["networking", "support", "publishing", "editing"],
    guides: ["writing prompts", "editing"]
};

// Fetch communities and categorize them
async function fetchByTags() {
    const communitiesRef = collection(db, "communities");
    const communityDocs = await getDocs(communitiesRef);

    const comCategories = {
        fiction: [],
        poetry: [],
        screenwriting: [],
        networking: [],
        guides: []
    };

    communityDocs.forEach((docSnapshot) => {
        const communityData = docSnapshot.data();
        const { name, tags, bio, members, bannerImage, profilePic } = communityData;

        if (!tags || !Array.isArray(tags)) return;

        // Assign community to matching categories
        for (const [category, tagList] of Object.entries(categoryTags)) {
            if (tags.some((tag) => tagList.includes(tag))) {
                comCategories[category].push({
                    name,
                    refId: docSnapshot.id,
                    bio: bio || "No description available.",
                    members: members?.length || 0, // Handle missing or empty member array
                    bannerImage: bannerImage || "default-banner.jpg",
                    profilePic: profilePic || "placeholder.jpg"
                });
            }
        }
    });

    return comCategories;
}

let selectedCategory = null;
const finishButton = document.getElementById("finish");
finishButton.addEventListener("click", () => {
    if (!finishButton.disabled) {
      window.location.href = "/html/home.html";
    }
  });  

const categoriesContainer = document.getElementById("categories"); 


function toggleFinishButton() {
    const hasJoinedCommunity = document.querySelector(".ps-join-btn.joined");
    finishButton.disabled = hasJoinedCommunity ? false : true; 
}
categoriesContainer.addEventListener("click", function (event) {
    const category = event.target;

    if (!category || !category.dataset.category) return;

    const categoryName = category.dataset.category;

    // second option for exiting
    if (selectedCategory === categoryName) {
        closeCommunityList();
        return;
    }

    // Update the selected category and show corresponding communities
    selectedCategory = categoryName;
    showCommunities(categoryName);
});
// show communities for category
async function showCommunities(categoryName) { 
    const categorizedCommunities = await fetchByTags(); 
    const communities = categorizedCommunities[categoryName] || [];
    if (communities.length === 0) return;

    // hide other categories 
    categoriesContainer.querySelectorAll("label").forEach((label) => {
        if (label.dataset.category !== categoryName) {
            label.classList.add("d-none");
        }
    });

    // create container
    const cl = document.createElement("div");
    cl.classList.add("community-list");

    // render community cards
    communities.forEach((community) => {
        const communityCard = createCommunityCard(community);
        cl.appendChild(communityCard);
    });

    categoriesContainer.appendChild(cl);
    const exitButton = document.createElement("button");
    exitButton.classList.add("exit-btn", "btn-secondary");
    exitButton.innerHTML = `<i class="bi bi-x"></i>`;
    exitButton.addEventListener("click", closeCommunityList);

    // Find the selected category label and append the exit button to it
    const selectedLabel = categoriesContainer.querySelector(`label[data-category="${categoryName}"]`);
    if (selectedLabel) {
        selectedLabel.appendChild(exitButton);
    } else {
        // fallback: if the label isn't found, append to the categories container
        categoriesContainer.appendChild(exitButton);
    }
}

function closeCommunityList() {
    const cl = document.querySelector(".community-list");
    const exitBtn = document.querySelector(".exit-btn");

    if (cl) cl.classList.add("d-none"); //hide community cards
    if (exitBtn) exitBtn.remove(); 


    categoriesContainer.querySelectorAll("label").forEach((label) => {    // categories reappear
        label.classList.remove("d-none");
    });

    
    selectedCategory = null; // clear or the old ones come with
}

// Function to create community card
function createCommunityCard(community) {
    const card = document.createElement("div");
    card.classList.add("ps-com-card");
    card.innerHTML =`
            <div class="ps-banner" style="background-image: url('${community.bannerImage}');"></div>
            <div class="ps-com-header">
                <img class="ps-com-pic" src="${community.profilePic}" alt="${community.name}" />
                <h4>${community.name}</h4>
            </div>
            <div class="ps-com-info">
                <p class="ps-com-bio">${community.bio}</p>
                <p class="ps-memcount">Members: ${community.members}</p>
            </div>
            <button class="ps-join-btn" data-community-id="${community.refId}">Join</button>
        `;

     

    // Handle Join button click
    card.querySelector(".ps-join-btn").addEventListener("click", function (event) {
        const button = event.target;
        const communityName = button.getAttribute("data-community-name");
        toggleJoinButton(button, communityName);
    });

    return card;
}

async function toggleJoinButton(button, communityId) {
    const userId = auth.currentUser.uid;
    const userRef = doc(db, "users", userId);
    const isJoining = !button.classList.contains("joined"); // Check if user is joining

    // toggle btn state with optional chaining
    button.classList.toggle("joined");
    button.innerText = isJoining ? "Joined!" : "Join";

    // update db
    await updateDoc(userRef, {
        members: isJoining ? arrayUnion(communityId) : arrayRemove(communityId)
    });

    // Update finish button state
    toggleFinishButton();
}


