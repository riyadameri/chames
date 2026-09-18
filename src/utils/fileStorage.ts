/**
 * Persistent image and file storage manager for Shams Platform
 * Handles reading files from device, canvas-based optimization to prevent quota issues,
 * and saving metadata/data URLs to local storage.
 */

export interface StoredFileRecord {
  id: string;
  name: string;
  sizeFormatted: string;
  sizeBytes: number;
  type: string;
  category: 'profile' | 'post' | 'activity' | 'media';
  dataUrl: string;
  uploadedAt: string;
}

const STORAGE_KEY_FILES = 'shams_files_library_v2';

/**
 * Optimizes an image file by resizing via HTML5 Canvas if needed
 * and returns high-fidelity base64 Data URL.
 */
export async function optimizeAndReadFileAsDataUrl(
  file: File, 
  maxWidth = 1280, 
  maxHeight = 1280, 
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image, read directly as data URL
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for standard photos to ensure compact storage, or PNG for graphics
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Saves an uploaded image file into the local files library
 */
export async function saveImageToFileSystem(
  file: File, 
  category: 'profile' | 'post' | 'activity' | 'media'
): Promise<{ dataUrl: string; record: StoredFileRecord }> {
  const dataUrl = await optimizeAndReadFileAsDataUrl(file);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const record: StoredFileRecord = {
    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: file.name,
    sizeFormatted: formatSize(file.size),
    sizeBytes: file.size,
    type: file.type || 'image/jpeg',
    category,
    dataUrl,
    uploadedAt: new Date().toISOString(),
  };

  try {
    const existing = getStoredFiles();
    // Keep most recent 50 files to avoid exceeding storage quota
    const updated = [record, ...existing].slice(0, 50);
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(updated));
  } catch (err) {
    console.warn('File storage notice: LocalStorage write quota reached, file kept in active state:', err);
  }

  return { dataUrl, record };
}

/**
 * Retrieves all stored files from the local files library
 */
export function getStoredFiles(category?: 'profile' | 'post' | 'activity' | 'media'): StoredFileRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILES);
    if (!raw) return [];
    const parsed: StoredFileRecord[] = JSON.parse(raw);
    if (!category) return parsed;
    return parsed.filter(f => f.category === category);
  } catch {
    return [];
  }
}

/**
 * Downloads a file locally
 */
export function downloadImageFile(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName || 'shams-image.jpg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
