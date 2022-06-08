import { getFileFromIndex, updateFileIndex } from "../utils/file-utils";
import { getLocalStorageIndex, updateLocalStorageIndex, updateSessionStorageValue } from "../utils/storage-utils";

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
  static STORAGE_KEY_RECENT = 'recent';
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

  static getRecentProjects = () => {
    const recent = getLocalStorageIndex(ProjectState.STORAGE_KEY_RECENT);

    return Object.values(recent)
      .map(e => {
        return {
          project: e.value,
          timestamp: new Date(e.timestamp),
        }
      })
      .sort((a, b) => {
        const timeA = a.timestamp.getTime();
        const timeB = b.timestamp.getTime();

        return timeA > timeB ? -1 :
          timeB > timeA ? 1 : 0
      })
  };

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
    updateSessionStorageValue(ProjectState.STORAGE_KEY_PROJECT, this);
    if (!this.empty())
      this.updateRecentProjects();
  }

  updateRecentProjects() {
    return updateLocalStorageIndex(ProjectState.STORAGE_KEY_RECENT, obj => obj.id, this, ProjectState.STORAGE_RECENT_MAX_SIZE);
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

  saveSourcesToIndex(srcs) {
    let sources = {};

    srcs.forEach(src => {
      let hash = updateFileIndex(src.data);
      sources[hash] = {
        hash,
        name: src.name,
        type: src.type,
      };
    });

    return sources;
  }

  setSources(srcs) {
    let tmp = srcs;

    if (Array.isArray(srcs)) { // check if the sources have dataurl in it somehow
      tmp = this.saveSourcesToIndex(srcs);
    }
    // srcs from saved project has dataurls
    //   save all to index
    //   trasnform srcs to have index and not data url
    this.sources = tmp;

    this.autoSave();
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

  getSourcesFromIndex() {
    return Object.values(this.sources)
      .map(src => {
        return { ...src, data: getFileFromIndex(src.hash) }
      });
  }

  exportFullState() {
    return { ...this, sources: this.getSourcesFromIndex() };
  }

}

export default ProjectState;