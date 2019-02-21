import {join, isAbsolute, relative} from 'path';

import { readdir, createReadStream } from 'fs-extra';
import program from 'commander'

import isXMLDocumentBudgetaire from '../src/isXMLDocumentBudgetaire.js'
import makeDocumentBudgetaireSummary from '../src/makeDocumentBudgetaireSummary.js'

import { version } from '../package.json'

function documentBudgetaireSummaryToPlanDeCompteURL({norme, sousNorme, année}){
    return `http://odm-budgetaire.org/composants/normes/${année}/${norme}/${sousNorme}/planDeCompte.xml`
}


program
.version(version)
.usage('--in <dossier> --out <dossier>')
.option('-i, --in <dir>', 'Dossier d\'entrée')
.option('-o, --out <dir>', 'Dossier de sortie')
.parse(process.argv)


const { in: inDir, out: outDir } = program

if (!inDir || !outDir) {
    console.error('Erreur: les option in et out sont obligatoires')
    program.help()
}

console.log('in', inDir, 'out', outDir)

readdir(inDir)
.then(files => {
    const absoluteFiles = files.map(f => isAbsolute(f) ? f : join(inDir, f))

    return Promise.all(absoluteFiles.map(isXMLDocumentBudgetaire))
    .then(isXMLDocumentBudgetaires => {
        return absoluteFiles.filter((f, i) => isXMLDocumentBudgetaires[i])
    })
    
})
.then(docBudgFiles => {
    console.log(`Fichiers <DocumentBudgetaire> trouvés dans le dossier ${inDir} :`)
    console.log(docBudgFiles.map(f => `- ${relative(process.env.PWD, f)}`).join('\n'))

    return Promise.all(docBudgFiles.map(f => makeDocumentBudgetaireSummary(createReadStream(f))))
    .then(summaries => new Map(summaries.map(s => [documentBudgetaireSummaryToPlanDeCompteURL(s), s])))
    .then(summaryByURL => {
        console.log('urls:\n', [...summaryByURL.keys()].join('\n'))
    })
})



