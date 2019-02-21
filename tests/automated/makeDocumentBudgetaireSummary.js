import { join } from 'path'
import { createReadStream } from 'fs'
import { strict as assert } from 'assert';

import makeDocumentBudgetaireSummary from '../../src/makeDocumentBudgetaireSummary.js'


describe('makeDocumentBudgetaireSummary', () => {

    it('should work on a simple example', () => {
        return makeDocumentBudgetaireSummary(createReadStream(join(__dirname, 'data', 'doc-budg-simple.xml')))
            .then(data => {
                assert.equal(data.norme, 'M52', 'norme');
                assert.equal(data.sousNorme, 'M52', 'sous-norme');
                assert.equal(data.année, '2013', 'année');
            })
    });

});
