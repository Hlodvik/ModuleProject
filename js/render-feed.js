import { listenToPostVotes, handleVote } from "./votes";

// Render the feed into the correct container
function renderFeed(posts, container) {
    if (!container) return; // Double-check just in case

    container.innerHTML = "";
    posts.forEach(post => container.appendChild(createPostElement(post)));
}

// Create individual post elements
function createPostElement(post) {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    postElement.innerHTML = `
    <div class="post-container">
        <div class="post-content">
            <div class="post-header">
                <span class="community-name">/co/${post.communityId}</span>
                <span class="author">
                    Posted by <a href="/u/${post.postAuthor}">${post.postAuthor}</a>
                </span>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-body">${truncateText(post.content || "", 1000)}</p>
            <div class="post-footer">
                <button class="vote-button upvote" data-voted="false">
                    <i class="bi bi-check-circle"></i>
                </button>
                <span class="vote-count">${post.votes || 0}</span>
                <button class="vote-button downvote" data-voted="false">
                    <i class="bi bi-x-circle"></i>
                </button>
                <span class="comment-count">
                    <i class="bi bi-chat"></i> ${post.comments || 0}
                </span>
            </div>
        </div>
    </div>
`;

    // Attach voting behavior
    const upvoteButton = postElement.querySelector(".upvote");
    const downvoteButton = postElement.querySelector(".downvote");
    const voteCount = postElement.querySelector(".vote-count");
    
    // Start real-time listener for votes
    listenToPostVotes(post.id, voteCount, upvoteButton, downvoteButton);
    
    // Upvote event listener
    upvoteButton.addEventListener("click", function () {
        const voted = this.dataset.voted === "true";
        this.dataset.voted = voted ? "false" : "true";
        handleVote(post.id, voted ? "remove-upvote" : "upvote");
    });
    
    // Downvote event listener
    downvoteButton.addEventListener("click", function () {
        const voted = this.dataset.voted === "true";
        this.dataset.voted = voted ? "false" : "true";
        handleVote(post.id, voted ? "remove-downvote" : "downvote");
    });

    return postElement;
}


// Truncate long post text
function truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

export { renderFeed };