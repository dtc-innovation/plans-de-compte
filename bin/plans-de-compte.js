import {join, isAbsolute, relative} from 'path';

import { readdir, createReadStream, createWriteStream, mkdir } from 'fs-extra';
import got from 'got';
import program from 'commander'

import isXMLDocumentBudgetaire from '../src/isXMLDocumentBudgetaire.js'
import makeDocumentBudgetaireSummary from '../src/makeDocumentBudgetaireSummary.js'

import { version } from '../package.json'

function documentBudgetaireSummaryToPlanDeCompteURL({norme, sousNorme, année}){
    return `http://odm-budgetaire.org/composants/normes/${année}/${norme}/${sousNorme}/planDeCompte.xml`
}

function documentBudgetaireSummaryToFileName({norme, sousNorme, année}){
    return `plan-de-compte-${norme}-${sousNorme}-${année}.xml`
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

const existingFilesInOutDirP = readdir(outDir)
.catch(err => {
    if(err.code === 'ENOENT'){
        console.warn(`Le dossier de sortie n'existe pas, il va être créé`)
        return mkdir(
            isAbsolute(outDir) ? outDir : join(process.env.PWD, outDir), 
            { recursive: true }
        )
        .then(() => [])
    }
    else throw err;
})
.then(files => new Set(files))



const neededPlanDeCompteByURLP = readdir(inDir)
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
        console.log('Plans de compte nécessaires:')
        console.log([...summaryByURL.values()].map(({norme, sousNorme, année}) => {
            return `${norme} - ${sousNorme} - ${année}`
        }).join('\n'))
        return summaryByURL
    })
})


Promise.all([neededPlanDeCompteByURLP, existingFilesInOutDirP])
.then(([neededPlanDeCompteByURL, existingFilesInOutDir]) => {
    const neededPlanDeCompteFileNamesAndURLs = [...neededPlanDeCompteByURL.entries()]
    .map(([url, summary]) => ({url, filename: documentBudgetaireSummaryToFileName(summary)}))
    
    const absentNeededPlanDeComptes = neededPlanDeCompteFileNamesAndURLs
        .filter(({filename}) => !existingFilesInOutDir.has(filename))

    console.log('Fichiers manquants :')
    console.log([...absentNeededPlanDeComptes.map(({filename}) => filename)].join('\n'))

    return Promise.all(absentNeededPlanDeComptes.map(({url, filename}) => {
        const absoluteFilename = join(
            isAbsolute(outDir) ? '' : process.env.PWD,
            outDir,
            filename
        );

        return new Promise((resolve, reject) => {
            const fileStream = createWriteStream(absoluteFilename);
            fileStream.on('finish', resolve)
            fileStream.on('error', reject)

            const networkStream = got.stream(url)

            networkStream.on('error', reject)

            networkStream.pipe(fileStream)
        })
    }))

})
.then(() => console.log(`Ayé, c'est fini !`))


