import forwardToRenderer from '../forwardToRenderer';
import windowManager from '../../helpers/windowManager';

jest.unmock('../forwardToRenderer');

describe('forwardToRenderer', () => {
  it('should pass an action through to the main store', () => {
    const next = jest.fn();
    const action = { type: 'SOMETHING' };

    forwardToRenderer()(next)(action);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(action);
  });

  it('should forward actions with a {scope: Symbol} in meta to the specific renderer', () => {
    const next = jest.fn();
    const action = {
      type: 'SOMETHING',
      meta: {
        scope: Symbol('W'),
      },
    };
    const send = jest.fn();
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
    const next = jest.fn();
    const action = {
      type: 'SOMETHING',
      meta: {
        scope: 'ConversationWindow',
      },
    };
    const send = jest.fn();

    windowManager.getAll.mockImplementation(() => ([{
      webContents: {
        send,
      },
    }]
    ));

    forwardToRenderer()(next)(action);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith('redux-action', action);
  });
});
