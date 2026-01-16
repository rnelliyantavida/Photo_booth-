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
      
      // Apply strict styles to the clone to mimic the "Print" version
      clone.style.margin = '0';
      clone.style.transform = 'none';
      
      // Match the "Print" CSS: width 750px + padding 20px approx equals A4 width
      // We use border-box with 794px width and 20px padding to simulate this
      clone.style.width = '794px';
      clone.style.maxWidth = '794px';
      clone.style.height = '1122px'; 
      clone.style.minHeight = '1122px';
      clone.style.maxHeight = '1122px';
      
      clone.style.padding = '20px'; // Add back some padding for aesthetics
      clone.style.boxSizing = 'border-box';
      clone.style.overflow = 'hidden';
      
      // Use Flexbox to distribute content and fill vertical space
      clone.style.display = 'flex';
      clone.style.flexDirection = 'column';
      clone.style.justifyContent = 'space-between'; // Push content to edges
      
      clone.style.border = 'none'; 
      clone.style.boxShadow = 'none';
      
      // FIX: Remove background image and set to white (like Print)
      clone.style.backgroundImage = 'none';
      clone.style.backgroundColor = '#ffffff';

      // FIX: Prevent image stretching in PDF
      const cloneImg = clone.querySelector('#uploadImage');
      if (cloneImg) {
        cloneImg.style.objectFit = 'cover';
        cloneImg.style.width = '100%';
        cloneImg.style.height = '100%';
      }

      container.appendChild(clone);
      document.body.appendChild(container);

      const opt = {
        margin:       0,
        filename:     'doha-newspaper.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: false,
          scrollY: 0,
          scrollX: 0,
          // Let html2canvas determine dimensions from the element
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
