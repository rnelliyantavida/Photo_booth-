const img = document.getElementById("uploadImage");
const fileInput = document.getElementById("fileInput");
const printBtn = document.getElementById("printBtn");

// Clicking the image opens file chooser (camera + gallery)
img.addEventListener("click", () => {
    fileInput.removeAttribute("capture"); // forces gallery + camera options
    fileInput.click();
});

// Load chosen image
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    img.src = URL.createObjectURL(file);
});

// Print only the newspaper
printBtn.addEventListener("click", () => {
    const printContents = document.getElementById("newspaper").innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    location.reload();
});
