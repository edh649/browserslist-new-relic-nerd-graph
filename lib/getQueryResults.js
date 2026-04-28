const https = require('https');

/**
 * Request and return data from the New Relic NerdGraph NRQL API.
 *
 * @param {string} query - A New Relic NRQL query.
 * @param {string} apiKey - A New Relic User API key.
 * @param {string} accountId - A New Relic account ID.
 * @param {boolean} debug - A flag for enabling debugging output.
 * @returns {object} - The query results.
 * @throws - On request error.
 * @throws - On error from New Relic NerdGraph.
 */
const getQueryResults = async (query, apiKey, accountId, debug = false) => {
    const graphqlQuery = {
        query: `query($nrql: Nrql!) {
            actor {
                account(id: ${accountId}) {
                    nrql(query: $nrql) {
                        results
                        totalResult
                    }
                }
            }
        }`,
        variables: { nrql: query },
    };

    let results;

    try {
        results = await new Promise((resolve, reject) => {
            const body = JSON.stringify(graphqlQuery);
            const options = {
                hostname: 'api.newrelic.com',
                path: '/graphql',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Api-Key': apiKey,
                    'Content-Length': Buffer.byteLength(body),
                },
            };

            let data = '';
            const request = https.request(options, (response) => {
                response.on('data', (buffer) => {
                    data += buffer;
                });
                response.on('end', () => resolve(data));
            });

            request.on('error', reject);
            request.write(body);
            request.end();
        });
    } catch (error) {
        if (debug) {
            console.debug(error);
        }

        throw new Error(error.message);
    }

    const parsedResults = JSON.parse(results);

    if (parsedResults.errors) {
        throw new Error(parsedResults.errors[0].message);
    }

    return parsedResults.data.actor.account.nrql;
};

module.exports = getQueryResults;
