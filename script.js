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

 




  // Handle Download PDF Button
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");
  downloadPdfBtn.addEventListener("click", async () => {
    // Check if running on file:// protocol
    if (window.location.protocol === 'file:') {
      alert("Security Error: PDF generation does not work when opening the file directly.\n\nPlease open this page using your local server:\nhttp://localhost:8000/newspaper.html");
      return;
    }

    const newspaper = document.getElementById("newspaper");
    
    // Create a clone of the newspaper to modify without affecting the UI
    const clone = newspaper.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    // Force desktop width (A4 width approx) to ensure desktop layout
    clone.style.width = '794px'; 
    document.body.appendChild(clone);

    try {
      // Helper function to convert image URL to Base64
      const toBase64 = async (url) => {
        if (url.startsWith('data:')) return url; // Already base64
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Failed to load image:', url, e);
          return url; // Return original if failed
        }
      };

      // Convert all images in the clone to Base64
      const images = clone.querySelectorAll('img');
      const promises = Array.from(images).map(async (img) => {
        const base64 = await toBase64(img.src);
        img.src = base64;
        // Ensure image is loaded before rendering
        await new Promise((resolve) => {
            if (img.complete) resolve();
            else {
                img.onload = resolve;
                img.onerror = resolve;
            }
        });
      });
      
      await Promise.all(promises);

      // Use html2canvas on the clone
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: false, // Disable CORS to prevent tainting on local/same-origin
        allowTaint: false, // Ensure we don't allow tainting (which blocks toDataURL)
        logging: false,
        windowWidth: 1600, // Force desktop width to trigger desktop media queries
        // width: 794 // REMOVED: This was causing the right side to be cut off
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      
      // Calculate dimensions to fit width (210mm)
      const imgWidth = 210; 
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Create PDF with custom dimensions to match the content exactly
      // This prevents white space at the bottom
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [imgWidth, imgHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      const pdfBlobUrl = pdf.output("bloburl");
      window.open(pdfBlobUrl, "_blank");

    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      // Clean up
      document.body.removeChild(clone);
    }
  });

});
  function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
  }
