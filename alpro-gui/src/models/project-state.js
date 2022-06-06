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
    const str = localStorage.getItem(ProjectState.STORAGE_KEY_RECENT);

    if (str === null) return [];

    const recent = JSON.parse(str);

    return Object.values(recent)
      .map(e => {
        return {
          project: e.project,
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
    this.sources = [];
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
    sessionStorage.setItem(ProjectState.STORAGE_KEY_PROJECT, JSON.stringify(this));
    if (!this.empty())
      this.updateRecentProjects();
  }

  updateRecentProjects() {
    let str = localStorage.getItem(ProjectState.STORAGE_KEY_RECENT);
    let recent;

    if (str === null)
      recent = {};
    else
      recent = JSON.parse(str);

    const obj = {
      timestamp: new Date(),
      project: this,
    };

    if (!(this.id in recent) &&
      Object.keys(recent).length >= ProjectState.STORAGE_RECENT_MAX_SIZE) {
      let oldest = Object.entries(recent)
        .reduce((old, curr) => {
          if (new Date(curr[1].timestamp).getTime() < new Date(old[1].timestamp).getTime()) return curr;
          return old;
        }, [this.id, obj])[0];
      delete recent[oldest];
    }

    recent[this.id] = obj;
    localStorage.setItem(ProjectState.STORAGE_KEY_RECENT, JSON.stringify(recent));
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

  setSources(srcs) {
    this.sources = srcs;

    this.autoSave();
  }

  addSource(src) {
    this.sources.push(src);

    this.autoSave();
  }

  setDeviceId(id) {
    this.deviceId = id;

    this.autoSave();
  }

}

export default ProjectState;