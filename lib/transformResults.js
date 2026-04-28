const browsers = require('./browsers');

/**
 * Transforms results from the New Relic NerdGraph NRQL API into usage
 * data formatted for use with Browserslist.
 *
 * @param {object} results - The results from the New Relic NerdGraph NRQL API.
 * @param {Array} results.results - The result rows.
 * @param {object} results.totalResult - Totals for the result set.
 * @param {boolean} debug - A flag for enabling debugging output.
 * @returns {object} - Usage data formatted for use with Browserslist.
 */
const transformResults = ({ results, totalResult }, debug = false) => {
    if (debug) {
        console.debug('\nNEW RELIC QUERY - TOTAL RESULT COUNT');
        console.debug(totalResult);
        console.debug('\nNEW RELIC QUERY - RECORDS:');
    }

    return results.reduce((transformedResults, result) => {
        if (debug) {
            console.debug(result);
        }

        const [browser, version, device] = result.facet;

        if (version !== 'Unknown') {
            const browserCount = result.count;
            const totalBrowserCount = totalResult.count;
            const transformedBrowser = browsers[`${browser}:${device}`];
            let browserPercentage = (browserCount / totalBrowserCount) * 100;
            browserPercentage = Math.round(browserPercentage * 100) / 100;

            if (
                transformedBrowser &&
                transformedResults[transformedBrowser] &&
                transformedResults[transformedBrowser][version]
            ) {
                transformedResults[transformedBrowser][version] +=
                    browserPercentage;
            } else if (
                transformedBrowser &&
                transformedResults[transformedBrowser]
            ) {
                transformedResults[transformedBrowser][version] =
                    browserPercentage;
            } else if (transformedBrowser) {
                transformedResults[transformedBrowser] = {
                    [version]: browserPercentage,
                };
            }
        }

        return transformedResults;
    }, {});
};

module.exports = transformResults;
