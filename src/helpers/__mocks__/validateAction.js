import { isFSA } from 'flux-standard-action';

jest.unmock('flux-standard-action');

export default jest.fn((action) => {
  if (!isFSA(action)) {
    return false;
  }
  return true;
});
