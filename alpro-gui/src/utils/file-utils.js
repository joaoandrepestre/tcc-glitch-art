import storage, { STORE_NAME_FILE_INDEX } from "../models/storage";
import { hash } from "./string-utils";

const STORAGE_KEY_FILE_INDEX = STORE_NAME_FILE_INDEX;
export const STORAGE_FILE_INDEX_MAX_SIZE = 100;

export const updateFileInIndex = (fileContent) =>
  storage.updateStoreWithValue(STORAGE_KEY_FILE_INDEX, hash, fileContent, STORAGE_FILE_INDEX_MAX_SIZE);

export const updateFilesInIndex = (fileContents) =>
  storage.updateStoreWithValues(STORAGE_KEY_FILE_INDEX, hash, fileContents, STORAGE_FILE_INDEX_MAX_SIZE);

export const getFileFromIndex = (fileHash) =>
  storage.getValueFromStore(STORAGE_KEY_FILE_INDEX, fileHash);

export const getFilesFromIndex = (fileHashes) =>
  storage.getValuesFromStore(STORAGE_KEY_FILE_INDEX, fileHashes);

const processFile = (addSource) => (e) => {
  let reader = new FileReader();

  let file_input = e.target;
  let file = file_input.files[0];
  reader.onload = (e) => {
    let dataURL = e.target.result;

    updateFileInIndex(dataURL);
    const fileHash = hash(dataURL);
    if (file.type.startsWith('video')) {
      addSource({ type: 'video', hash: fileHash, data: dataURL, name: file.name });
    }
    else {
      addSource({ type: 'img', hash: fileHash, data: dataURL, name: file.name });
    }

    file_input.value = null;
  };
  reader.readAsDataURL(file);
};

const processProjectFile = (updateProjectJSON) => (e) => {
  let reader = new FileReader();

  let file_input = e.target;
  let file = file_input.files[0];
  reader.onload = (e) => {
    let str = e.target.result;
    let json = JSON.parse(str);
    updateProjectJSON(json);
    file_input.value = null;
  };
  reader.readAsText(file);
};

export const loadProject = (updateProjectJSON) => () => {
  let project_input = document.createElement('input');
  project_input.type = 'file';
  project_input.accept = '.alpro';
  project_input.hidden = true;
  project_input.onchange = processProjectFile(updateProjectJSON);
  project_input.click();
};

export const openImage = (addSource) => () => {
  let image_input = document.createElement('input');
  image_input.type = 'file';
  image_input.accept = 'image/png,image/jpeg';
  image_input.hidden = true;
  image_input.onchange = processFile(addSource);
  image_input.click();
};

export const openVideo = (addSource) => () => {
  let video_input = document.createElement('input');
  video_input.type = 'file';
  video_input.accept = 'video/*';
  video_input.hidden = true;
  video_input.onchange = processFile(addSource);
  video_input.click();
};

