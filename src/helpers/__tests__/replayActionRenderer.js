import { ipcRenderer } from 'electron';
import replayActionRenderer from '../replayActionRenderer';

jest.unmock('../replayActionRenderer');
jest.unmock('../validateAction');

describe('replayActionRenderer', () => {
  it('should replay any fsa actions received', () => {
    const store = {
      dispatch: jest.fn(),
    };
    const invalidAction = { number: 123 };

    replayActionRenderer(store);

    expect(ipcRenderer.on).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.on.mock.calls[0][0]).toBe('redux-action');
    expect(ipcRenderer.on.mock.calls[0][1]).toBeInstanceOf(Function);

    const cb = ipcRenderer.on.mock.calls[0][1];
    cb('someEvent', invalidAction);

    expect(store.dispatch).toHaveBeenCalledTimes(0);

    const validAction = { type: 'ANY_TYPE', payload: 123 };
    cb('someEvent', validAction);

    expect(store.dispatch).toHaveBeenCalledTimes(1);
    expect(store.dispatch).toHaveBeenCalledWith(
      { payload: 123, meta: { scope: 'local' } },
    );
  });
});
