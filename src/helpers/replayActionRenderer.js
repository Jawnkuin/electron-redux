import { ipcRenderer } from 'electron';
import validateAction from './validateAction';

export default function replayActionRenderer(store) {
  ipcRenderer.on('redux-action', (event, payload) => {
    if (!validateAction(payload)) {
      return;
    }
    // to avoid endless-loop
    const rendererAction = {
      ...payload,
      meta: {
        ...payload.meta,
        scope: 'local',
      },
    };
    store.dispatch(rendererAction);
  });
}
