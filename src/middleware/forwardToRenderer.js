import { BrowserWindow } from 'electron';
import validateAction from '../helpers/validateAction';
import windowManager from '../helpers/windowManager';

const forwardToRenderer = () => next => (action) => {
  if (!validateAction(action)) return next(action);

  // Only actions specified with scope in meta
  // will be send to correspond renderer process

  const scope = action.meta ? action.meta.scope : null;
  if (scope) {
    if (typeof scope === 'symbol') {
      windowManager.get(scope)
      .webContents.send('redux-action', action);
    } else if (typeof scope === 'string') {
      if (scope === '__ALL__') {
        const allWindows = BrowserWindow.getAllWindows();
        allWindows.forEach(({ webContents }) => {
          webContents.send('redux-action', action);
        });
      } else {
        const openWindows = windowManager.getAll(action.meta.scope);
        openWindows.forEach(({ webContents }) => {
          webContents.send('redux-action', action);
        });
      }
    }
  }

  return next(action);
};

export default forwardToRenderer;
