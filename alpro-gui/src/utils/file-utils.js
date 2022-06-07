import { hash } from "./string-utils";

const STORAGE_KEY_FILE_INDEX = "file-index";
const STORAGE_FILE_INDEX_MAX_SIZE = 100;

export const updateFileIndex = (fileContent) => {
  const str = localStorage.getItem(STORAGE_KEY_FILE_INDEX);
  let index;

  if (str === null)
    index = {};
  else
    index = JSON.parse(str);

  const h = hash(fileContent);
  const obj = {
    timestamp: new Date(),
    file: fileContent,
  };

  if (!(h in index) &&
    Object.keys(index).length >= STORAGE_FILE_INDEX_MAX_SIZE) {
    let oldest = Object.entries(index)
      .reduce((old, curr) => {
        if (new Date(curr[1].timestamp).getTime() < new Date(old[1].timestamp).getTime()) return curr;
        return old;
      }, [h, obj])[0];
    delete index[oldest];
  }

  index[h] = obj;
  localStorage.setItem(STORAGE_KEY_FILE_INDEX, JSON.stringify(index));
  return h;
};

export const getFileFromIndex = (fileHash) => {
  const str = localStorage.getItem(STORAGE_KEY_FILE_INDEX);

  if (str === null) return "";

  const index = JSON.parse(str);
  return fileHash in index ? index[fileHash].file : "";
};

const processFile = (addSource) => (e) => {
  let reader = new FileReader();

  let file_input = e.target;
  let file = file_input.files[0];
  reader.onload = (e) => {
    let dataURL = e.target.result;

    let fileHash = updateFileIndex(dataURL);
    if (file.type.startsWith('video')) {
      addSource({ type: 'video', hash: fileHash, name: file.name });
    }
    else {
      addSource({ type: 'img', hash: fileHash, name: file.name });
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

