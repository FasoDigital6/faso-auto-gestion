/**
 * Rogne les marges (quasi-)blanches ou transparentes autour du contenu
 * visible d'une image (ex: signature ou cachet scannés).
 *
 * Utilisé à l'upload de la signature/du cachet dans Paramètres, pour que ces
 * deux images se touchent visuellement une fois placées côte à côte dans le
 * bloc signataire du PDF (`PdfFooterBlock` / `Signataire` dans
 * `src/components/pdf/common.tsx`) — sans ce rognage, la marge blanche
 * interne du fichier source laisse un grand vide entre les deux, même quand
 * les cadres CSS des deux images se touchent.
 *
 * Fonctionne côté navigateur (Canvas 2D) sur un `File` local, donc avant tout
 * upload — pas de souci CORS puisqu'on ne lit jamais une image distante.
 * Si le rognage échoue pour une raison quelconque (image vide, canvas
 * indisponible…), on retourne le fichier d'origine plutôt que de bloquer
 * l'upload.
 */
export async function trimImageWhitespace(
  file: File,
  options?: { padding?: number; threshold?: number }
): Promise<File> {
  const padding = options?.padding ?? 6;
  // Luminosité (0-255) au-dessus de laquelle un pixel opaque est considéré
  // comme faisant partie du fond plutôt que du contenu dessiné.
  const threshold = options?.threshold ?? 245;

  try {
    const image = await loadImage(file);

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width === 0 || canvas.height === 0) return file;

    ctx.drawImage(image, 0, 0);
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        const isBackground = a < 10 || (r > threshold && g > threshold && b > threshold);
        if (!isBackground) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Rien détecté (image vide ou entièrement blanche) : on ne touche à rien.
    if (maxX < 0) return file;

    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    // Rien à gagner si le contenu occupe déjà (quasi) toute l'image.
    if (cropWidth >= width - 2 && cropHeight >= height - 2) return file;

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = cropWidth;
    cropCanvas.height = cropHeight;
    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) return file;
    cropCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      cropCanvas.toBlob(resolve, "image/png")
    );
    if (!blob) return file;

    const trimmedName = file.name.replace(/\.[^./\\]+$/, "") + "_rogne.png";
    return new File([blob], trimmedName, { type: "image/png" });
  } catch {
    return file;
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}
