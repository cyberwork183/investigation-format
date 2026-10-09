/**
 * imageHandler.js
 * Browser-side image validation, scaling, preview, and ArrayBuffer conversion for WordprocessingML.
 */

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates and scales an image file to a standard passport aspect ratio (approx 3.5cm x 4.5cm).
 * Returns { dataUrl, arrayBuffer, width, height }
 */
export async function processImageFile(file, maxWidth = 480, maxHeight = 600) {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('Invalid file format. Please upload a JPEG, PNG, or WebP image.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image file is too large. Maximum allowed size is 5 MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.onload = () => {
        // Create canvas for proportional scaling and clean PNG conversion
        let w = img.width;
        let h = img.height;

        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        // Fill white background for transparent images
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/png', 0.92);

        // Convert dataUrl to ArrayBuffer for JSZip
        const byteString = atob(dataUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        resolve({
          dataUrl,
          arrayBuffer: ab,
          width: w,
          height: h
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
