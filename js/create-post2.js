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

    /** Ensure Focus */
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
    postBody.addEventListener("paste", function (event) {
        event.preventDefault(); // Prevent default pasting behavior

        const text = (event.clipboardData || window.clipboardData).getData("text/plain"); // Get plain text
        document.execCommand("insertText", false, text); // Insert as plain text at cursor position
    });
    /** Apply Formatting */
    function applyFormatting(command, value = null) {
        ensureFocus();
        document.execCommand(command, false, value);
        updateButtonStates();
    }

    /** Bold Toggle */
    boldBtn.addEventListener("click", () => {
        applyFormatting("bold");
        activeFormatting.bold = document.queryCommandState("bold");
        updateButtonStates();
    });

    /** Italic Toggle */
    italicBtn.addEventListener("click", () => {
        applyFormatting("italic");
        activeFormatting.italic = document.queryCommandState("italic");
        updateButtonStates();
    });

    /** Populate Font Size Dropdown */
    const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 34, 36, 38, 40];
    fontSizeMenu.innerHTML = ""; // Clear previous items
    fontSizes.forEach(size => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#";
        link.classList.add("dropdown-item");
        link.textContent = `${size}px`;
        link.addEventListener("click", function (e) {
            e.preventDefault();
            applyFormatting("fontSize", 7); // Temporary font size placeholder

            // Find applied font and change its size
            const spans = postBody.querySelectorAll("font[size='7']");
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

    /** Prevent dropdown from closing on click */
    fontSizeMenu.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    /** Update Button States */
    function updateButtonStates() {
        boldBtn.classList.toggle("active", activeFormatting.bold);
        italicBtn.classList.toggle("active", activeFormatting.italic);
    }
});