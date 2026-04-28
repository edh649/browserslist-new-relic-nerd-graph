const https = require('https');
const getQueryResults = require('../getQueryResults');

jest.mock('https');

beforeEach(() => {
    https.request.mockImplementation((options, callback) => {
        callback({
            on: (type, handler) => {
                if (type === 'data') {
                    handler('{}');
                } else if (type === 'end') {
                    handler();
                }
            },
        });
        return { on: () => {}, write: () => {}, end: () => {} };
    });
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('getQueryResults module', () => {
    test('logs debugging info', async () => {
        https.request.mockImplementationOnce((options, callback) => {
            callback({
                on: () => {},
            });
            return {
                on: (type, handler) => handler({ message: 'it broke' }),
                write: () => {},
                end: () => {},
            };
        });
        jest.spyOn(console, 'debug').mockImplementation(() => {});

        await expect(getQueryResults('', '', '', true)).rejects.toThrow();
        expect(console.debug).toHaveBeenCalledTimes(1);
    });

    test('returns response JSON', () => {
        const mockNrqlData = { results: [], totalResult: {} };
        const mockResponse = {
            data: { actor: { account: { nrql: mockNrqlData } } },
        };

        https.request.mockImplementationOnce((options, callback) => {
            callback({
                on: (type, handler) => {
                    if (type === 'data') {
                        handler(JSON.stringify(mockResponse));
                    } else if (type === 'end') {
                        handler();
                    }
                },
            });
            return {
                on: () => {},
                write: () => {},
                end: () => {},
            };
        });

        return expect(getQueryResults('', '', '')).resolves.toStrictEqual(
            mockNrqlData
        );
    });

    test('throws on http error', () => {
        https.request.mockImplementationOnce((options, callback) => {
            callback({
                on: () => {},
            });
            return {
                on: (type, handler) => handler({ message: 'it broke' }),
                write: () => {},
                end: () => {},
            };
        });

        return expect(getQueryResults('', '', '')).rejects.toThrow();
    });

    test('throws on error from New Relic', () => {
        https.request.mockImplementationOnce((options, callback) => {
            callback({
                on: (type, handler) => {
                    if (type === 'data') {
                        handler('{"errors":[{"message":"It broke"}]}');
                    } else if (type === 'end') {
                        handler();
                    }
                },
            });
            return {
                on: () => {},
                write: () => {},
                end: () => {},
            };
        });

        return expect(getQueryResults('', '', '')).rejects.toThrow();
    });
});
