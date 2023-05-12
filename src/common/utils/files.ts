import fs from 'node:fs';

export async function createDirIfNotExists(dirPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dirPath)) {
      resolve(true);
    }

    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (e) {
      reject(e.message);
    }
  });
}

export async function saveFile(pathToSave, file) {
  return new Promise((resolve, reject) => {
    const pathToFile = pathToSave + '/' + file.originalname;
    fs.writeFile(pathToFile, file.buffer, (error) => {
      if (error) {
        reject(error);
      }
      resolve(pathToFile);
    });
  });
}
