document.addEventListener("DOMContentLoaded", () => {
  const uploadImage = document.getElementById("uploadImage");
  const fileInput = document.getElementById("fileInput");
  const printBtn = document.getElementById("printBtn");

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
  // ----- Display Current Date -----
  function getOrdinal(n) {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }

  const today = new Date();
  const options = { weekday: "long", month: "long", year: "numeric" };
  const day = today.getDate();
  const ordinal = getOrdinal(day);
  const formattedDate = today.toLocaleDateString("en-US", options)
    .replace(today.getDate(), day + ordinal)
    .toUpperCase(); // Optional: uppercase to match style

  dateElement.textContent = formattedDate;
});

});
