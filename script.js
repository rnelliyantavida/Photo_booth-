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

  // Handle PDF Button
  const pdfBtn = document.getElementById("pdfBtn");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => {
      const element = document.getElementById("newspaper");
      const originalText = pdfBtn.innerText;
      pdfBtn.innerText = "Generating...";

      // Clone the element to isolate it from the page layout (flexbox centering)
      const clone = element.cloneNode(true);
      
      // Create a container for the clone to hold it at exactly 0,0
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '0px';
      container.style.left = '0px';
      container.style.width = '794px'; // A4 width
      container.style.zIndex = '-9999'; // Hide it
      container.style.margin = '0';
      container.style.padding = '0';
      
      // Apply strict styles to the clone
      clone.style.margin = '0';
      clone.style.transform = 'none';
      clone.style.width = '794px';
      clone.style.maxWidth = '794px';
      clone.style.minHeight = '1122px';
      clone.style.height = 'auto';
      clone.style.boxSizing = 'border-box';
      // Ensure no border/shadow affects dimensions if they are outside box-sizing
      clone.style.border = 'none'; 
      clone.style.boxShadow = 'none';
      
      // FIX: Remove background image (SVG data URI) which often causes "Operation is insecure" on iOS
      clone.style.backgroundImage = 'none';
      clone.style.backgroundColor = '#f7f1e5'; // Keep the paper color

      container.appendChild(clone);
      document.body.appendChild(container);

      const opt = {
        margin:       0,
        filename:     'doha-newspaper.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: false, // Disable CORS to prevent "Operation is insecure" on iOS
          scrollY: 0,
          scrollX: 0,
          windowWidth: 794,
          width: 794,
          x: 0,
          y: 0
        },
        jsPDF:        { unit: 'px', format: [794, 1122], orientation: 'portrait' }
      };
      
      // Small delay to ensure rendering
      setTimeout(() => {
        html2pdf().set(opt).from(clone).save().then(() => {
          document.body.removeChild(container);
          pdfBtn.innerText = originalText;
          
          // Helpful tip for iOS users
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            alert("PDF Ready!\n\nIf it opened in a preview:\n1. Tap the Share button (square with arrow).\n2. Select 'Save to Files'.\n\nOtherwise, check your 'Files' app.");
          }
        }).catch((err) => {
          console.error(err);
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          pdfBtn.innerText = originalText;
          alert("Error: " + (err.message || err));
        });
      }, 100);
    });
  }
 




});
  function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
  }
