import sharp from 'sharp';

/**
 * Optimiza una imagen redimensionándola y convirtiéndola a WebP.
 * @param {Buffer} buffer - Buffer de la imagen original
 * @returns {Promise<Buffer>} Buffer optimizado en formato WebP
 */
export default async function resizeImage (buffer) {
  const optimizedBuffer = await sharp(buffer, {animated: true})
  .resize({
    width: 1024,
    height: 1024,
    fit: 'inside',
    withoutEnlargement: true,
    kernel: 'lanczos3'
  })
  .webp({
    quality: 85,
    alphaQuality: 100,
    smartSubsample: true,
    effort: 6
  })
  .toBuffer();

  return optimizedBuffer;
}
