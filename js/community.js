import { db } from "./main.js";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"; 
import { fetchCommunityFeed } from "./feed.js";

document.addEventListener("DOMContentLoaded", async () => {
    const nameElem = document.getElementById("communityName");
    const picElem = document.getElementById("communityPic");
    const bannerElem = document.getElementById("banner");
    const bioElem = document.getElementById("bio");
    const adminsElem = document.getElementById("admins");
    const membersElem = document.getElementById("members");
    const memCountElem = document.getElementById("memCount");

    const pathSegments = window.location.pathname.split("/");
    const communitySubdomain = pathSegments[2]; // format: /co/{subdomain}

    // dont put errors in my console bc im on the home page thanks
    if (!window.location.pathname.startsWith("/co/")) {
        return;
    }

    try {
        // get the row with subdomain query
        const q = query(collection(db, "communities"), where("subdomain", "==", communitySubdomain));
        const querySnapshot = await getDocs(q);
        //just in case      
        if (querySnapshot.empty) {
            console.error("Community not found:", communitySubdomain);
            return;
        }

        
        const communityDoc = querySnapshot.docs[0]; // get the match
        const communityData = communityDoc.data(); // extract the fields
        const communityId = communityDoc.id;    // keep the id handy

        // Fill in community details
        if (nameElem) nameElem.textContent = communityData.name;
        if (bioElem) bioElem.textContent = communityData.bio || "";
        if (picElem && bannerElem) loadImages(communityData.communityPicUrl, communityData.bannerUrl);
        if (adminsElem) loadAdmins(adminsElem, communityData.admins);
        if (membersElem) loadMembers(membersElem, communityData.members);

        //  call fetchCommunityFeed with commID
        fetchCommunityFeed(communityId);

    } catch (error) {
        console.error("Error loading community", error);
    }

    function loadImages(profilePicUrl, bannerUrl) {
        if (picElem && profilePicUrl) {
            picElem.src = profilePicUrl;
            localStorage.setItem("communityProfilePic", profilePicUrl);
        }  

        if (bannerElem && bannerUrl) {
            bannerElem.src = bannerUrl;
            localStorage.setItem("communityBannerPic", bannerUrl);
        }  
    }

    async function loadAdmins(adminsElem, adminUIDs) {
        // get admins usernames
        const adminUsernames = await Promise.all(
            adminUIDs.map(async (uid) => {
                const userSnap = await getDoc(doc(db, "users", uid));
                if (userSnap.exists()) {
                    return userSnap.data().username;
                }
                return "Unknown Admin";
            })
        );
        // Populate admins list
        adminsElem.innerHTML = adminUsernames.map(name => `<li>${name}</li>`).join("");
    }

    async function loadMembers(membersElem, memberUIDs) {
        if (!memberUIDs || memberUIDs.length === 0) {
            membersElem.innerHTML = "<li>No members yet</li>";
            return;
        }
        // get members usernames
        const membersList = await Promise.all(
            memberUIDs.map(async (uid) => {
                try {
                    const userSnap = await getDoc(doc(db, "users", uid));
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        const profilePic = userData.profilePic || "/images/default-picture.png";
                        return `
                            <li class="d-flex align-items-center my-2">
                                <img src="${profilePic}" class="rounded-circle me-2" width="30" height="30">
                                <a href="/u/${userData.username}" class="text-white">${userData.username}</a>
                            </li>`;
                    }
                } catch (error) {
                    console.error(`Error fetching user ${uid}:`, error);
                }
                return "Unknown User";
            })
        );
        // populate members list, plus count
        memCountElem.innerHTML =
            `<strong>Members:</strong> ${memberUIDs.length}`;
        membersElem.innerHTML = membersList.join("");
    }
});
