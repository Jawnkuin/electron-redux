import { ipcRenderer } from 'electron';
import replayActionRenderer from '../replayActionRenderer';

jest.unmock('../replayActionRenderer');

describe('replayActionRenderer', () => {
  const store = {
    dispatch: jest.fn(),
  };
  replayActionRenderer(store);
  const cb = ipcRenderer.on.mock.calls[0][1];

  it('should replay any fsa received', () => {
    expect(ipcRenderer.on).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.on.mock.calls[0][0]).toBe('redux-action');
    expect(cb).toBeInstanceOf(Function);

    const invalidAction = { number: 123 };
    cb('someEvent', invalidAction);
    expect(store.dispatch).toHaveBeenCalledTimes(0);

    const validAction = { type: 'ANY_TYPE', payload: 123 };
    cb('someEvent', validAction);
    expect(store.dispatch).toHaveBeenCalledTimes(1);
  });

  it('should attach a {scope: "local"} to an fsa meta', () => {
    const validAction = { type: 'ANY_TYPE', payload: 123 };
    cb('someEvent', validAction);

    expect(store.dispatch).toHaveBeenCalledWith(
      { payload: 123, meta: { scope: 'local' }, type: 'ANY_TYPE' },
    );
  });
});
