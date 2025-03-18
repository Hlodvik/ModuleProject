document.addEventListener("DOMContentLoaded", function () {
    const postBody = document.getElementById("postBody");
    const addMediaBtn = document.getElementById("addMediaBtn");
    const postMedia = document.getElementById("postMedia");
    const mediaModal = document.getElementById("mediaModal");
    const insertMediaBtn = document.getElementById("insertMediaBtn");
    const mediaPreview = document.getElementById("mediaPreview");
    
    if (!postBody || !addMediaBtn || !postMedia || !mediaModal || !insertMediaBtn || !mediaPreview) { 
        return;
    }

    /** Open Media Modal on Click */
    addMediaBtn.addEventListener("click", () => {
        mediaModal.classList.add("show");
        mediaModal.style.display = "block";
    });

    /** Enable Insert Button When File is Selected */
    postMedia.addEventListener("change", function () {
        insertMediaBtn.disabled = !this.files.length;
        if (this.files.length) {
            const file = this.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                mediaPreview.innerHTML = `<img src="${e.target.result}" >`;
            };
            reader.readAsDataURL(file);
        }
    });
 
    insertMediaBtn.addEventListener("click", function () {
        if (!postMedia.files.length) return;
        
        const file = postMedia.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.maxWidth = "75vw";
            img.style.maxHeight = "75vh";
            img.style.cursor = "pointer";
            img.style.display = "inline-block";
            img.style.margin = "5px";
            img.setAttribute("draggable", false);
            insertAtCursor(postBody, img);
        };
        reader.readAsDataURL(file);

        mediaModal.classList.remove("show");
        mediaModal.style.display = "none";
    });

    /** insert media at cursor */
    function insertAtCursor(container, element) {
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            container.appendChild(element);
            return;
        }
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(element);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStartAfter(element);
        newRange.collapse(true);
        selection.addRange(newRange);
    }
});