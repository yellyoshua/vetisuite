const UPLOAD_EXTENSIONS = {
  jpg: 'jpg',
  jpeg: 'jpeg',
  png: 'png',
  webp: 'webp',
  gif: 'gif',
  pdf: 'pdf',
  doc: 'doc',
  docx: 'docx'
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/x-png', 'image/webp', 'image/gif'];

export function canonicalExtension (fileName) {
  const name = String(fileName || '');
  const extension = name.slice(name.lastIndexOf('.') + 1).toLowerCase();

  return UPLOAD_EXTENSIONS[extension] || null;
}

export function isImageFile (file) {
  const name = typeof file === 'string' ? file : file.name;
  const extension = name.slice(name.lastIndexOf('.') + 1).toLowerCase();

  return IMAGE_EXTENSIONS.includes(extension) || IMAGE_MIME_TYPES.includes(file.type);
}
