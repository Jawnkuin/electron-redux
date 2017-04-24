const windowManager = {
  get: jest.fn(() => ({
    webContents: {
      send: jest.fn(),
    },
  })),
  getAll: jest.fn(() => ([{
    webContents: {
      send: jest.fn(),
    },
  }])),
};

export default windowManager;
