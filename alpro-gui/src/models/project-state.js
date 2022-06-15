import { getFilesFromIndex, updateFilesInIndex } from "../utils/file-utils";
import { updateSessionStorageValue } from "../utils/storage-utils";
import storage, { STORE_NAME_RECENT_PROJECTS } from "./storage";

class CoreState {
  constructor() {
    this.source = { type: null, data: null };
    this.effects = [];
  }

  updateSource(src) {
    this.source = src;
  }

  updateEffects(effects) {
    this.effects = effects;
  }
}

class ProjectState {

  static STORAGE_KEY_PROJECT = 'project';
  static STORAGE_KEY_RECENT = STORE_NAME_RECENT_PROJECTS;
  static STORAGE_RECENT_MAX_SIZE = 5;

  static newProject = (name) => {
    const proj = new ProjectState(name);

    proj.autoSave();

    return proj;
  };

  static loadProject = (json) => {
    const proj = new ProjectState(json.name, json.id);

    proj.loadFromJSON(json);

    return proj;
  }

  static getRecentProjects = () =>
    storage.getFullStoreByName(ProjectState.STORAGE_KEY_RECENT)
      .then(recent =>
        recent.map(e => {
          return {
            project: e.value,
            timestamp: new Date(e.timestamp),
          }
        }).sort((a, b) => {
          const timeA = a.timestamp.getTime();
          const timeB = b.timestamp.getTime();

          return timeA > timeB ? -1 :
            timeB > timeA ? 1 : 0
        }).slice(0, this.STORAGE_RECENT_MAX_SIZE)
      );

  constructor(name, id) {
    this.id = id ? id : Object.id(this);
    this.activeEffects = [];
    this.coreState = new CoreState();
    this.name = name ? name : "";
    this.sources = {};
    this.deviceId = null;
  }

  empty() {
    return this.activeEffects.length === 0 &&
      this.coreState.source.type === 'unset' &&
      this.coreState.effects.length === 0 &&
      this.name === "" &&
      this.sources.length === 0 &&
      this.deviceId === null;
  }

  loadFromJSON(json) {
    this.setActiveEffects(json.activeEffects);
    this.updateCoreSource(json.coreState.source);
    this.updateCoreEffects(json.coreState.effects);
    this.updateName(json.name);
    this.setSources(json.sources);
    this.setDeviceId(json.deviceId);

    this.autoSave();
  }

  autoSave() {
    let sources = Object.values(this.sources)
      .map(src => {
        const { name, type, hash } = src;
        return { name, type, hash };
      });
    let proj = { ...this, sources };
    updateSessionStorageValue(ProjectState.STORAGE_KEY_PROJECT, proj)
    if (!this.empty())
      this.updateRecentProjects(proj);
  }

  updateRecentProjects(project) {
    storage.updateStoreWithValue(ProjectState.STORAGE_KEY_RECENT, obj => obj.id, project, ProjectState.STORAGE_RECENT_MAX_SIZE);
  }

  setActiveEffects(activeEffects) {
    this.activeEffects = activeEffects;

    this.autoSave();
  }

  toggleActiveEffect(effectId) {
    let key = effectId.toString();
    let idx = this.activeEffects.findIndex(e => e === key);
    if (idx === -1) this.activeEffects.push(key);
    else this.activeEffects.splice(idx, 1);

    this.autoSave();
  }

  removeActiveEffect(effectId) {
    let key = effectId.toString();
    let idx = this.activeEffects.findIndex(e => e === key);
    if (idx !== -1) this.activeEffects.splice(idx, 1);

    this.autoSave();
  }

  updateCoreSource(src) {
    this.coreState.updateSource(src);

    this.autoSave();
  }

  updateCoreEffects(effects) {
    this.coreState.updateEffects(effects);

    this.autoSave();
  }

  updateName(name) {
    this.name = name;

    this.autoSave();
  }

  saveSourcesToIndex() {
    const srcs = Object.values(this.sources);
    const fileContents = srcs.map(src => src.data);

    return updateFilesInIndex(fileContents)
      .then(hashes =>
        hashes.map((hash, i) => {
          const { name, type } = this.sources[hash];
          return { hash, name, type, };
        })
      );
  }

  setSources(srcs) {
    if (Array.isArray(srcs)) {
      this.getSourcesFromIndex(srcs).then(sources => { this.sources = sources });// add loading
    } else {
      this.sources = srcs;
      this.autoSave();
    }
  }

  addSource(src) {
    const { hash } = src;
    this.sources[hash] = src;

    this.autoSave();
  }

  setDeviceId(id) {
    this.deviceId = id;

    this.autoSave();
  }

  getSourcesFromIndex(srcs) {
    const hashes = srcs.map(src => src.hash);
    return getFilesFromIndex(hashes)
      .then(values => {
        const sources = {};
        values.forEach((value, i) => {
          sources[hashes[i]] = {
            ...srcs[i],
            data: value,
          };
        });
        return sources;
      });
  }
}

export default ProjectState;