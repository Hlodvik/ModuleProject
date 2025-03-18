document.addEventListener("DOMContentLoaded", function () {
    const postBody = document.getElementById("postBody");
    const boldBtn = document.getElementById("boldBtn");
    const italicBtn = document.getElementById("italicBtn");
    const fontSizeBtn = document.getElementById("fontSizeBtn");
    const fontSizeMenu = document.getElementById("fontSizeDropdown");

    if (!postBody || !boldBtn || !italicBtn || !fontSizeBtn || !fontSizeMenu) {
        console.warn("One or more text formatting elements are missing.");
        return;
    }

    let activeFormatting = {
        bold: false,
        italic: false,
        fontSize: null,
    };
 
    function ensureFocus() {
        postBody.focus();
        const selection = window.getSelection();
        if (!selection.rangeCount) {
            const range = document.createRange();
            range.selectNodeContents(postBody);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
/** i didnt like copying sample text and pasting it with font color and background or highlight so plain text paste only */
postBody.addEventListener("paste", function (event) {
    event.preventDefault();  
    const text = event.clipboardData?.getData("text/plain") || ""; 
    document.activeElement.innerText += text;
});

/** Apply Formatting (Toggle for Future Typing) */
function toggleFormatting(style) {
    ensureFocus(); // keep the cursor in the contenteditable
    if (style === "bold") {
        const isBold = postBody.style.fontWeight === "bold";
        postBody.style.fontWeight = isBold ? "normal" : "bold";
        activeFormatting.bold = !isBold;
    } else if (style === "italic") {
        const isItalic = postBody.style.fontStyle === "italic";
        postBody.style.fontStyle = isItalic ? "normal" : "italic";
        activeFormatting.italic = !isItalic;
    }

    updateButtonStates();
}

/** Bold Toggle */
boldBtn.addEventListener("click", () => {
    toggleFormatting("bold");
});

/** Italic Toggle */
italicBtn.addEventListener("click", () => {
    toggleFormatting("italic");
});

    /** font size dropdown */
    const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 34, 36, 38, 40];
    fontSizeMenu.innerHTML = ""; 
    fontSizes.forEach(size => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#";
        link.classList.add("dropdown-item");
        link.textContent = `${size}px`;
        link.addEventListener("click", function (e) {
            e.preventDefault();
            applyFormatting("fontSize", 12);  

            // Find applied font and change its size
            const spans = postBody.querySelectorAll("font[size='12']");
            spans.forEach(span => {
                span.removeAttribute("size");
                span.style.fontSize = `${size}px`;
            }); 
            activeFormatting.fontSize = size;
            fontSizeBtn.textContent = `${size}px`; // Update button text
        });
        item.appendChild(link);
        fontSizeMenu.appendChild(item);
    });

  
    /* update button states, could be improved */
    function updateButtonStates() {
        boldBtn.classList.toggle("active", activeFormatting.bold);
        italicBtn.classList.toggle("active", activeFormatting.italic);
    }
});