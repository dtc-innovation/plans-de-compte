//import {join} from 'path';

import program from 'commander'
import * as fs from 'fs-extra';

import { version } from '../package.json'

const { readdir } = fs;

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
        console.log('files', files.join('\n'))
    })

