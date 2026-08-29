/*
 * Verifica que los bytes reales del archivo coincidan con el mime declarado por el cliente.
 * El navegador (o un atacante) controla file.type; sin esto se podrían subir bytes arbitrarios
 * con Content-Type falsificado y servirlos luego desde nuestro origen.
 */

function startsWith (buffer, bytes) {
  if (buffer.length < bytes.length) {
    return false;
  }

  return bytes.every((byte, index) => buffer[index] === byte);
}

function isJpeg (buf) {
  return startsWith(buf, [0xff, 0xd8, 0xff]);
}

function isPng (buf) {
  return startsWith(buf, [0x89, 0x50, 0x4e, 0x47]);
}

function isGif (buf) {
  return startsWith(buf, [0x47, 0x49, 0x46, 0x38]);
}

function isWebp (buf) {
  return buf.length >= 12 && startsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
}

function isPdf (buf) {
  return startsWith(buf, [0x25, 0x50, 0x44, 0x46]);
}

// DOCX y otros OOXML son ZIP (PK\x03\x04); .doc legacy es OLE compound (D0 CF 11 E0)
function isZip (buf) {
  return startsWith(buf, [0x50, 0x4b, 0x03, 0x04]);
}

function isOle (buf) {
  return startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0]);
}

const matchers = {
  'image/jpeg': isJpeg,
  'image/png': isPng,
  'image/gif': isGif,
  'image/webp': isWebp,
  'application/pdf': isPdf,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': isZip,
  'application/msword': (buf) => isOle(buf) || isZip(buf)
};

/** @returns {boolean} true si los bytes coinciden con el mime declarado */
export function matchesDeclaredType (buffer, declaredType) {
  const matcher = matchers[declaredType];

  if (!matcher) {
    return false;
  }

  return matcher(buffer);
}
