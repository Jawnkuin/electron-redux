import { BrowserWindow } from 'electron';
import forwardToRenderer from '../forwardToRenderer';
import windowManager from '../../helpers/windowManager';


jest.unmock('../forwardToRenderer');

describe('forwardToRenderer', () => {
  let next;
  let send;
  let windows;
  beforeEach(() => {
    next = jest.fn();
    send = jest.fn();
    windows = [
      { webContents: { send } }, { webContents: { send } }, { webContents: { send } },
    ];
  });
  it('should pass an action through to the main store', () => {
    const action = { type: 'SOMETHING' };

    forwardToRenderer()(next)(action);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should forward actions with a {scope: Symbol} in meta to the specific renderer', () => {
    const action = {
      type: 'SOMETHING',
      meta: {
        scope: Symbol('W'),
      },
    };

    windowManager.get.mockImplementation(() => ({
      webContents: {
        send,
      },
    }));

    forwardToRenderer()(next)(action);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('redux-action', action);
  });

  it('should forward actions with {scope: String} to renderers with the name', () => {
    const action = {
      type: 'SOMETHING',
      meta: {
        scope: 'ConversationWindow',
      },
    };
    windowManager.getAll.mockImplementation(() => windows);

    forwardToRenderer()(next)(action);

    expect(send).toHaveBeenCalledTimes(3);
    expect(send).toHaveBeenCalledWith('redux-action', action);
  });

  it('should forward actions with {scope: "__ALL__"} to renderers with the name', () => {
    const action = {
      type: 'SOMETHING',
      meta: {
        scope: '__ALL__',
      },
    };

    BrowserWindow.getAllWindows.mockImplementation(() => windows);

    forwardToRenderer()(next)(action);

    expect(send).toHaveBeenCalledTimes(3);
    expect(send).toHaveBeenCalledWith('redux-action', action);
  });
});
