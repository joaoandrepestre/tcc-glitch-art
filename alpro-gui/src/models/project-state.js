class CoreState {
  constructor() {
    this.source = null;
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

  static newProject = (name) => {
    const proj = new ProjectState(name);

    proj.autoSave();

    return proj;
  }

  constructor(name) {
    this.activeEffects = [];
    this.coreState = new CoreState();
    this.name = name ? name : "";
    this.sources = [];
    this.deviceId = null;
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
    localStorage.setItem(ProjectState.STORAGE_KEY_PROJECT, JSON.stringify(this));
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