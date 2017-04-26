const MAX_LISTENERS = 15;
class WindowManager {


  constructor() {
    this.windows = {};
    this.nameReferences = {};
    this.IDMap = {};
    this.loadedListeners = [];
    this.closedListeners = [];
  }

  subscribeWindowLoadedListener(fn) {
    if (!fn || typeof fn !== 'function') {
      throw Error(`${fn} is not a valid callback function`);
    }
    if (this.loadedListeners.length >= MAX_LISTENERS) {
      throw Error(`amount of listeners should not more than ${MAX_LISTENERS} `);
    }
    // return an unsubcrible function
    function unsubcrible() {
      const index = this.loadedListeners.indexOf(fn);
      this.loadedListeners.splice(index, 1);
    }
    unsubcrible.bind(this);
    return unsubcrible;
  }

  subscribeWindowCloseedListener(fn) {
    if (!fn || typeof fn !== 'function') {
      throw Error(`${fn} is not a valid callback function`);
    }
    if (this.closedListeners.length >= MAX_LISTENERS) {
      throw Error(`amount of listeners should not more than ${MAX_LISTENERS} `);
    }
    this.closedListeners.push(fn);
    // return an unsubcrible function
    function unsubcrible() {
      const index = this.closedListeners.indexOf(fn);
      this.closedListeners.splice(index, 1);
    }
    unsubcrible.bind(this);
    return unsubcrible;
  }

  add(window, name = null) {
    if (!name || typeof name !== 'string') {
      throw new Error('"name" has to be a valid string');
    }

    const newID = Symbol(name);
    this.windows[newID] = window;
    this.IDMap[window.id] = newID;


    window.on('closed', () => {
      delete this.windows[newID];
      for (let i = 0; i < this.closedListeners.length; i += 1) {
        const listener = this.closedListeners[i];
        listener(newID, name);
      }
    });

    window.webContents.on('did-finish-load', () => {
      if (!window) {
        throw new Error('window is not defined');
      }
      for (let i = 0; i < this.loadedListeners.length; i += 1) {
        const listener = this.loadedListeners[i];
        listener(newID, name);
      }
      window.show();
    });

    if (name) {
      this.nameReferences[name] = this.nameReferences[name] || [];
      this.nameReferences[name].push(newID);
    }
    return newID;
  }

  get(windowID) {
    return this.windows[windowID] || null;
  }

  getByInternalID(internalID) {
    if (this.IDMap[internalID]) {
      return this.windows[this.IDMap[internalID]] || null;
    }
    return null;
  }

  getAll(name) {
    const toReturn = [];
    (this.nameReferences[name] || []).forEach(
      (ID) => {
        if (this.get(ID)) {
          toReturn.push(this.get(ID));
        }
      });
    return toReturn;
  }

  close(windowID) {
    if (this.windows[windowID]) {
      this.windows[windowID].close();
    }
  }
}

export default new WindowManager();
