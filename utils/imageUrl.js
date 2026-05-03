export function normalizeImageUrl(url) {
  if (!url) return '';

  const cleanUrl = String(url).trim();

  if (!cleanUrl) return '';

  // Imagen local dentro de public, ejemplo:
  // /productos/shampoo.jpg
  if (cleanUrl.startsWith('/')) {
    return cleanUrl;
  }

  // Si ya viene como enlace directo de googleusercontent, dejarlo igual
  if (cleanUrl.includes('lh3.googleusercontent.com')) {
    return cleanUrl;
  }

  // Google Drive: /file/d/ID/view
  const driveFileMatch = cleanUrl.match(/\/file\/d\/([^/]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}=w1000`;
  }

  // Google Drive: ?id=ID
  const driveIdMatch = cleanUrl.match(/[?&]id=([^&]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=w1000`;
  }

  // URL normal externa
  return cleanUrl;
}
