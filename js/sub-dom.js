import { db } from "./auth.js";
import { doc, getDoc } from "firebase/firestore";

document.addEventListener("DOMContentLoaded", async () => {
    // Function to rewrite profile links to /u/username
    async function rewriteUserLink() {
        const link = document.querySelector("a[href^='/u/']");
        if (!link) return;
    
        const parts = link.href.split('/');
        const uid = parts.pop(); // Get the last part of the URL
    
        const userDoc = await getDoc(doc(db, "users", uid));
        document.body.setAttribute("data-user-id", uid);
        link.setAttribute("href", `/u/${userDoc.data().username}`);
    }
    
    function rewriteCommunityLink() {
        const link = document.querySelector('a[href^="/html/community.html?name="]');
        if (!link) return;
    
        const url = new URL(link.href, window.location.origin);
        const communityName = url.searchParams.get("name");
    
        if (communityName) {
            link.setAttribute("href", `/co/${communityName}`);
        }
    }
    
    function rewritePostLink() {
        const link = document.querySelector('a[href^="/html/post.html?id="]');
        if (!link) return;
    
        const url = new URL(link.href, window.location.origin);
        const postID = url.searchParams.get("id");
    
        if (postID) {
            link.setAttribute("href", `/post/${postID}`);
        }
    }
    
    function rewriteInternalLinks() {
        const link = document.querySelector('a[href^="/html/"]');
        if (!link) return;
    
        const url = new URL(link.href, window.location.origin);
        const pageName = url.pathname.replace("/html/", "").replace(".html", "");
    
        // Only rewrite if it hasn’t been rewritten already
        if (!link.getAttribute("data-rewritten")) {
            link.setAttribute("href", `/${pageName}${url.search}`);
            link.setAttribute("data-rewritten", "true");
        }
    }

    // Run once on page load
    await rewriteUserLink();
    rewriteCommunityLink();
    rewritePostLink();
    rewriteInternalLinks();
});
 
