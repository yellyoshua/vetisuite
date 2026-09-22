import storage from '@/utils/storage.js';

const SAFE_PATH = (/^[a-zA-Z0-9\-_./]+$/);

const validators = {
  isOwnFile (filePath, userId, currentValue) {
    if (currentValue !== undefined && filePath === currentValue) {
      return true;
    }

    if (!storage.isTemporal(filePath) || filePath.includes('..')) {
      return false;
    }

    return filePath.split('/')[1] === userId;
  },

  isSafePath (filePath, allowedFolders) {
    if (!filePath || filePath.includes('..') || filePath.startsWith('/')) {
      return false;
    }

    if (!SAFE_PATH.test(filePath)) {
      return false;
    }

    return allowedFolders.includes(filePath.split('/').shift());
  }
};

export default validators;
