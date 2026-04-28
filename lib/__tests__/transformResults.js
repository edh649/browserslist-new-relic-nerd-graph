const transformResults = require('../transformResults');

afterEach(() => {
    jest.resetAllMocks();
});

describe('transformResults module', () => {
    test('sum the count when encountering a dupe', () => {
        const givenData = {
            totalResult: { count: 100 },
            results: [
                { facet: ['Chrome', '86', 'Desktop'], count: 25 },
                { facet: ['Chrome', '86', 'Desktop'], count: 75 },
            ],
        };
        const expectedData = { chrome: { 86: 100 } };
        const actualData = transformResults(givenData);

        expect(actualData).toStrictEqual(expectedData);
    });

    test('adds a new version when a browser already exists', () => {
        const givenData = {
            totalResult: { count: 100 },
            results: [
                { facet: ['Chrome', '86', 'Desktop'], count: 25 },
                { facet: ['Chrome', '84', 'Desktop'], count: 75 },
            ],
        };
        const expectedData = { chrome: { 86: 25, 84: 75 } };
        const actualData = transformResults(givenData);

        expect(actualData).toStrictEqual(expectedData);
    });

    test("adds a new browser that doesn't exist", () => {
        const givenData = {
            totalResult: { count: 100 },
            results: [
                { facet: ['Chrome', '86', 'Desktop'], count: 100 },
                { facet: ['Safari', 'Unknown', 'Desktop'], count: 1 },
                { facet: ['Fake Browser', '0.0.1', 'Desktop'], count: 1 },
            ],
        };
        const expectedData = { chrome: { 86: 100 } };
        const actualData = transformResults(givenData);

        expect(actualData).toStrictEqual(expectedData);
    });

    test('outputs debug messages', () => {
        const givenData = {
            totalResult: { count: 100 },
            results: [{ facet: ['Chrome', '86', 'Desktop'], count: 100 }],
        };
        jest.spyOn(console, 'debug').mockImplementation(() => {});

        transformResults(givenData, true);
        expect(console.debug).toHaveBeenCalledTimes(4);
    });
});
