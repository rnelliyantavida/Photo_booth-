document.addEventListener("DOMContentLoaded", () => {
  const uploadImage = document.getElementById("uploadImage");
  const fileInput = document.getElementById("fileInput");
  const printBtn = document.getElementById("printBtn");

  // Handle Image Upload
  uploadImage.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log("=== IMAGE UPLOAD DEBUG ===");
    console.log("File:", file.name, file.type, file.size);

    try {
      // CRITICAL: Wait for container to finish calculating its size
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Get container dimensions AFTER layout settles
      const container = uploadImage.parentElement;
      const rect = container.getBoundingClientRect();
      console.log("Container size:", rect.width, "×", rect.height);

      // Ensure we have valid dimensions
      if (rect.width === 0 || rect.height === 0) {
        throw new Error("Container has no dimensions yet");
      }

      // Pre-process image
      const processedDataUrl = await processImageFile(file, rect.width, rect.height);
      uploadImage.src = processedDataUrl;
      
      console.log("Image processed successfully");
    } catch (error) {
      console.error("Error processing image:", error);
      // Fallback
      const reader = new FileReader();
      reader.onload = (e) => uploadImage.src = e.target.result;
      reader.readAsDataURL(file);
    }
  });

  // Process image file with explicit container dimensions and EXIF correction
  function processImageFile(file, containerWidth, containerHeight) {
    return new Promise((resolve, reject) => {
      // First, read EXIF orientation
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const orientation = getExifOrientation(arrayBuffer);
        console.log("EXIF Orientation:", orientation);
        
        // Now read as data URL for image processing
        const reader2 = new FileReader();
        reader2.onload = (e2) => {
          const img = new Image();
          
          img.onload = () => {
            console.log("Original image:", img.width, "×", img.height);
            console.log("Target container:", containerWidth, "×", containerHeight);
            
            // Determine actual dimensions after rotation
            let imgWidth = img.width;
            let imgHeight = img.height;
            
            // For orientations 5-8, swap width/height
            if (orientation >= 5 && orientation <= 8) {
              [imgWidth, imgHeight] = [imgHeight, imgWidth];
            }
            
            console.log("After rotation:", imgWidth, "×", imgHeight);
            
            // Create canvas matching container size
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = Math.round(containerWidth);
            canvas.height = Math.round(containerHeight);
            
            console.log("Canvas size:", canvas.width, "×", canvas.height);
            
            // Calculate cover dimensions using rotated dimensions
            const imgRatio = imgWidth / imgHeight;
            const containerRatio = containerWidth / containerHeight;
            
            let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
            
            if (imgRatio > containerRatio) {
              drawHeight = canvas.height;
              drawWidth = drawHeight * imgRatio;
              offsetX = (canvas.width - drawWidth) / 2;
            } else {
              drawWidth = canvas.width;
              drawHeight = drawWidth / imgRatio;
              offsetY = (canvas.height - drawHeight) / 2;
            }
            
            console.log("Draw dimensions:", drawWidth, "×", drawHeight, "at", offsetX, offsetY);
            
            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Apply EXIF orientation transform
            ctx.save();
            applyExifOrientation(ctx, orientation, canvas.width, canvas.height, drawWidth, drawHeight, offsetX, offsetY);
            
            // Draw image
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            ctx.restore();
            
            console.log("Image drawn to canvas with orientation correction");
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            console.log("Data URL length:", dataUrl.length);
            
            resolve(dataUrl);
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e2.target.result;
        };
        
        reader2.onerror = () => reject(new Error('Failed to read file as data URL'));
        reader2.readAsDataURL(file);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }
  
  // Get EXIF orientation from image file
  function getExifOrientation(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    
    if (view.getUint16(0, false) !== 0xFFD8) return 1; // Not JPEG
    
    let offset = 2;
    while (offset < view.byteLength) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      
      if (marker === 0xFFE1) { // APP1 marker (EXIF)
        const exifOffset = offset + 10;
        const littleEndian = view.getUint16(exifOffset, false) === 0x4949;
        
        const ifdOffset = view.getUint32(exifOffset + 4, littleEndian);
        const tagCount = view.getUint16(exifOffset + ifdOffset, littleEndian);
        
        for (let i = 0; i < tagCount; i++) {
          const tagOffset = exifOffset + ifdOffset + 2 + i * 12;
          const tag = view.getUint16(tagOffset, littleEndian);
          
          if (tag === 0x0112) { // Orientation tag
            return view.getUint16(tagOffset + 8, littleEndian);
          }
        }
        break;
      } else {
        const size = view.getUint16(offset, false);
        offset += size;
      }
    }
    
    return 1; // Default orientation
  }
  
  // Apply EXIF orientation transform to canvas context
  function applyExifOrientation(ctx, orientation, canvasW, canvasH, imgW, imgH, offsetX, offsetY) {
    const centerX = canvasW / 2;
    const centerY = canvasH / 2;
    
    ctx.translate(centerX, centerY);
    
    switch (orientation) {
      case 2: // Flip horizontal
        ctx.scale(-1, 1);
        break;
      case 3: // Rotate 180°
        ctx.rotate(Math.PI);
        break;
      case 4: // Flip vertical
        ctx.scale(1, -1);
        break;
      case 5: // Rotate 90° CW + flip horizontal
        ctx.rotate(Math.PI / 2);
        ctx.scale(1, -1);
        break;
      case 6: // Rotate 90° CW
        ctx.rotate(Math.PI / 2);
        break;
      case 7: // Rotate 90° CCW + flip horizontal
        ctx.rotate(-Math.PI / 2);
        ctx.scale(1, -1);
        break;
      case 8: // Rotate 90° CCW
        ctx.rotate(-Math.PI / 2);
        break;
    }
    
    ctx.translate(-centerX, -centerY);
  }

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

      const clone = element.cloneNode(true);
      
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '0px';
      container.style.left = '0px';
      container.style.width = '794px';
      container.style.zIndex = '-9999';
      container.style.margin = '0';
      container.style.padding = '0';
      
      clone.style.margin = '0';
      clone.style.transform = 'none';
      clone.style.width = '794px';
      clone.style.maxWidth = '794px';
      clone.style.height = '1122px'; 
      clone.style.minHeight = '1122px';
      clone.style.maxHeight = '1122px';
      clone.style.padding = '20px';
      clone.style.boxSizing = 'border-box';
      clone.style.overflow = 'hidden';
      clone.style.display = 'flex';
      clone.style.flexDirection = 'column';
      clone.style.justifyContent = 'space-between';
      clone.style.border = 'none'; 
      clone.style.boxShadow = 'none';
      clone.style.backgroundImage = 'none';
      clone.style.backgroundColor = '#ffffff';

      // Fix image in clone
      const cloneImg = clone.querySelector('#uploadImage');
      if (cloneImg) {
        cloneImg.style.objectFit = 'cover';
        cloneImg.style.objectPosition = 'center';
        cloneImg.style.width = '100%';
        cloneImg.style.height = '100%';
        cloneImg.style.position = 'absolute';
        cloneImg.style.top = '0';
        cloneImg.style.left = '0';
      }

      container.appendChild(clone);
      document.body.appendChild(container);

      const opt = {
        margin: 0,
        filename: 'doha-newspaper.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          scrollY: 0,
          scrollX: 0,
        },
        jsPDF: { unit: 'px', format: [794, 1122], orientation: 'portrait' }
      };
      
      setTimeout(() => {
        html2pdf().set(opt).from(clone).save().then(() => {
          document.body.removeChild(container);
          pdfBtn.innerText = originalText;
          
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
