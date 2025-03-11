

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", function () {
    const postBody = document.getElementById("postBody");
    
    function wrapSelectedText(tag) {
        const start = postBody.selectionStart;
        const end = postBody.selectionEnd;
        const selectedText = postBody.value.substring(start, end);
        const beforeText = postBody.value.substring(0, start);
        const afterText = postBody.value.substring(end);
        
        if (selectedText) {
            postBody.value = `${beforeText}[${tag}]${selectedText}[/${tag}]${afterText}`;
            postBody.setSelectionRange(start + tag.length + 2, end + tag.length + 2);
            postBody.focus();
        }
    }

    // Bold button
    document.getElementById("boldBtn").addEventListener("click", function () {
        wrapSelectedText("b");
    });

    // Italic button
    document.getElementById("italicBtn").addEventListener("click", function () {
        wrapSelectedText("i");
    });

    // Font size dropdown handling
    document.querySelectorAll(".font-size-option").forEach(option => {
        option.addEventListener("click", function (e) {
            e.preventDefault();
            const fontSize = this.getAttribute("data-size").replace("px", "");
            const start = postBody.selectionStart;
            const end = postBody.selectionEnd;
            const selectedText = postBody.value.substring(start, end);
            const beforeText = postBody.value.substring(0, start);
            const afterText = postBody.value.substring(end);

            if (selectedText) {
                postBody.value = `${beforeText}[size=${fontSize}]${selectedText}[/size]${afterText}`;
                postBody.setSelectionRange(start + fontSize.length + 7, end + fontSize.length + 7);
                postBody.focus();
            }
        });
    });
});}