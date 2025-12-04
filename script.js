document.addEventListener("DOMContentLoaded", () => {
  const uploadImage = document.getElementById("uploadImage");
  const fileInput = document.getElementById("fileInput");
  const printBtn = document.getElementById("printBtn");
    const dateElement = document.getElementById("current-date"); // Added


  // Handle Image Upload
  uploadImage.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadImage.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle Print Button
  printBtn.addEventListener("click", () => {
    window.print();
  });
 

  




});
