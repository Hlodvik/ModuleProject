//don't grade me on this, I didn't write it. Was pulling my hair out trying to get it to work right but it was too much, so called in a friend. again, not my work.

document.addEventListener("DOMContentLoaded", function () {
    let resizingImage = null;
    let startX, startY, startWidth, startHeight, aspectRatio, resizeType;
    
    document.getElementById("postBody").addEventListener("mousemove", function (event) {
        if (event.target.tagName === "IMG") {
            setResizeCursor(event.target, event);
        }
    });

    document.getElementById("postBody").addEventListener("mousedown", function (event) {
        if (event.target.tagName === "IMG") {
            determineResizeType(event.target, event);
        }
    });

    function setResizeCursor(img, event) {
        const rect = img.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const edgeThreshold = 10;

        if (offsetX < edgeThreshold && offsetY < edgeThreshold || 
            offsetX > rect.width - edgeThreshold && offsetY > rect.height - edgeThreshold || 
            offsetX < edgeThreshold && offsetY > rect.height - edgeThreshold || 
            offsetX > rect.width - edgeThreshold && offsetY < edgeThreshold) {
            img.style.cursor = "nwse-resize";
        } else if (offsetX < edgeThreshold || offsetX > rect.width - edgeThreshold) {
            img.style.cursor = "ew-resize";
        } else if (offsetY < edgeThreshold || offsetY > rect.height - edgeThreshold) {
            img.style.cursor = "ns-resize";
        } else {
            img.style.cursor = "default";
        }
    }

    function determineResizeType(img, event) {
        const rect = img.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const edgeThreshold = 10;
        
        startX = event.clientX;
        startY = event.clientY;
        startWidth = img.clientWidth;
        startHeight = img.clientHeight;
        aspectRatio = img.naturalWidth / img.naturalHeight;
        resizingImage = img;

        if (offsetX < edgeThreshold && offsetY < edgeThreshold || 
            offsetX > rect.width - edgeThreshold && offsetY > rect.height - edgeThreshold || 
            offsetX < edgeThreshold && offsetY > rect.height - edgeThreshold || 
            offsetX > rect.width - edgeThreshold && offsetY < edgeThreshold) {
            resizeType = "corner";
        } else if (offsetX < edgeThreshold || offsetX > rect.width - edgeThreshold) {
            resizeType = "side";
        } else if (offsetY < edgeThreshold || offsetY > rect.height - edgeThreshold) {
            resizeType = "top-bottom";
        } else {
            resizingImage = null;
            return;
        }

        document.addEventListener("mousemove", resizeImage);
        document.addEventListener("mouseup", stopResizing);
        document.addEventListener("keydown", handleKeyPress);
    }

    function resizeImage(event) {
        if (!resizingImage) return;
        let deltaX = event.clientX - startX;
        let deltaY = event.clientY - startY;

        if (resizeType === "corner") {
            let newWidth = Math.max(4, Math.min(window.innerWidth * 0.6, startWidth + deltaX));
            let newHeight = Math.max(4, Math.min(window.innerHeight * 0.6, newWidth / aspectRatio));
            resizingImage.style.width = `${newWidth}px`;
            resizingImage.style.height = `${newHeight}px`;
        } else if (resizeType === "side") {
            let newWidth = Math.max(4, Math.min(window.innerWidth * 0.6, startWidth + deltaX));
            resizingImage.style.width = `${newWidth}px`;
        } else if (resizeType === "top-bottom") {
            let newHeight = Math.max(4, Math.min(window.innerHeight * 0.6, startHeight + deltaY));
            resizingImage.style.height = `${newHeight}px`;
        }
    }

    function stopResizing() {
        if (resizingImage) {
            resizingImage.style.cursor = "default";
        }
        document.removeEventListener("mousemove", resizeImage);
        document.removeEventListener("mouseup", stopResizing);
    }

    function handleKeyPress(event) {
        if (event.key === "Enter" && resizingImage) {
            resizingImage.style.cursor = "default";
            resizingImage = null;
            document.removeEventListener("keydown", handleKeyPress);
        }
    }
});
