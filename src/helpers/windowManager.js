import _ from 'lodash';

class WindowManager {
  constructor() {
    this.windows = {};
    this.nameReferences = {};
    this.IDMap = {};
    this.focus = [null];
  }

  add(window, name = null, onContentloaded) {
    if (!name || typeof name !== 'string') {
      throw new Error('"name" has to be a valid string');
    }

    const newID = Symbol(name);
    this.windows[newID] = window;
    this.IDMap[window.id] = newID;


    window.on('closed', () => {
      delete this.windows[newID];
      // Actions.closeWindow(newID, name);
      // action REMOVE_WINDOW to be added
    });
    window.on('focus', () => {
      const focusIndex = _.findLastIndex(this.focus, win => win !== null);
      if (focusIndex && focusIndex >= 0 && this.focus[focusIndex].id !== window.id) {
        this.focus[focusIndex].focus();
      }
    });
    window.on('enter-full-screen', () => {
      window.webContents.send('window:changefullscreen', true);
    });

    window.on('leave-full-screen', () => {
      window.webContents.send('window:changefullscreen', false);
    });


    window.webContents.on('did-finish-load', () => {
      if (!window) {
        throw new Error('window is not defined');
      }

      // Actions.addWindow(newID, name);
      window.show();
      window.focus();
      // Callback for window content loaded
      if (onContentloaded && typeof onContentloaded === 'function') {
        onContentloaded();
      }
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
    _.forEach(this.nameReferences[name] || [], (ID) => {
      if (this.get(ID)) {
        toReturn.push(this.get(ID));
      }
    });
    return toReturn;
  }

  forceFocus(window) {
    const index = this.focus.length;
    this.focus.push(window);
    window.on('close', () => {
      this.focus[index] = null;
    });
  }

  close(windowID) {
    if (this.windows[windowID]) {
      this.windows[windowID].close();
    }
  }
}

export default new WindowManager();
