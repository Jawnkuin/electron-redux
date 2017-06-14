import windowManager from '../windowManager';

jest.unmock('../windowManager');


describe('windowManager', () => {
  let onContentloadedCallback;
  let win;
  let winLoadListener;
  let winCloseListener;
  beforeEach(() => {
    onContentloadedCallback = jest.fn();
    win = {
      on: jest.fn(),
      webContents: {
        on: jest.fn(),
      },
      id: 'window1',
      show: jest.fn(),
    };
    winLoadListener = jest.fn();
    winCloseListener = jest.fn();
    windowManager.loadedListeners = [];
    windowManager.closedListeners = [];
  });

  it('should add window to get a symbol ref to window', () => {
    const newId = windowManager.add(win, 'dialog', onContentloadedCallback);
    const win2 = {
      on: jest.fn(),
      webContents: {
        on: jest.fn(),
      },
      id: 'window2',
      show: jest.fn(),
    };
    const win3 = {
      on: jest.fn(),
      webContents: {
        on: jest.fn(),
      },
      id: 'window3',
      show: jest.fn(),
    };
    windowManager.add(win2, 'dialog', onContentloadedCallback);
    windowManager.add(win3, 'main', onContentloadedCallback);
    expect(() => { windowManager.add(win3); }).toThrow();

    expect(typeof newId).toBe('symbol');
    expect(windowManager.windows[newId]).toBe(win);

    const winById = windowManager.get(newId);
    expect(winById).toBe(win);

    const winByInternalId = windowManager.getByInternalID(win.id);
    expect(winByInternalId).toBe(win);
    const winByInternalId2 = windowManager.getByInternalID('nonexist id');
    expect(winByInternalId2).toBeNull();

    const allDialogWins = windowManager.getAll('dialog');
    expect(allDialogWins.length).toBe(2);
  });

  it('should call binded callbacks and listeners', () => {
    windowManager.subscribeWindowClosedListener(winCloseListener);
    windowManager.subscribeWindowLoadedListener(winLoadListener);

    expect(windowManager.loadedListeners.length).toBe(1);
    expect(windowManager.closedListeners.length).toBe(1);

    const newId = windowManager.add(win, 'dialog', onContentloadedCallback);

    const wincb = win.on.mock.calls[0][1];
    const contentcb = win.webContents.on.mock.calls[0][1];

    expect(wincb).toBeInstanceOf(Function);
    expect(contentcb).toBeInstanceOf(Function);

    expect(win.on).toHaveBeenCalledTimes(1);
    expect(win.webContents.on).toHaveBeenCalledTimes(1);

    contentcb('did-finish-load');
    expect(onContentloadedCallback).toHaveBeenCalledTimes(1);
    expect(winLoadListener).toHaveBeenCalledTimes(1);
    expect(winLoadListener).toHaveBeenCalledWith(newId, 'dialog');

    wincb('closed');
    expect(winCloseListener).toHaveBeenCalledTimes(1);
    expect(winCloseListener).toHaveBeenCalledWith(newId, 'dialog');
  });

  it('should remove window reference', () => {
    const newId = windowManager.add(win, 'dialog', onContentloadedCallback);
    const wincb = win.on.mock.calls[0][1];
    win.close = jest.fn(() => { wincb('closed'); });
    windowManager.close(newId);
    expect(windowManager.windows[newId]).toBeUndefined();
  });

  it('should be able to add or remove listeners', () => {
    const unsubscribleLoad = windowManager.subscribeWindowLoadedListener(winLoadListener);
    const unsubscribleClose = windowManager.subscribeWindowClosedListener(winCloseListener);

    expect(windowManager.loadedListeners.length).toBe(1);
    unsubscribleLoad();
    expect(windowManager.loadedListeners.length).toBe(0);

    expect(windowManager.closedListeners.length).toBe(1);
    unsubscribleClose();
    expect(windowManager.closedListeners.length).toBe(0);
    expect(() => { windowManager.subscribeWindowClosedListener('notAFunction'); }).toThrow();
    expect(() => { windowManager.subscribeWindowLoadedListener('notAFunction'); }).toThrow();

    expect(() => {
      for (let i = 0; i < 16; i += 1) {
        windowManager.subscribeWindowClosedListener(winCloseListener);
      }
    }).toThrow();
    expect(() => {
      for (let i = 0; i < 16; i += 1) {
        windowManager.subscribeWindowLoadedListener(winLoadListener);
      }
    }).toThrow();
  });
});
