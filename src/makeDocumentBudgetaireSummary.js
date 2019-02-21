import Parser from 'node-xml-stream-parser'

/**
 * Get plan de compte data from a <DocumentBudgetaire> DOM object
 */

export default function(docBudgStream){

    const p = new Parser();

    const normeP = new Promise((resolve) => {
        
        p.on('opentag', (name) => {
            if(name === 'EnTeteBudget'){
                p.on('opentag', (name, attributes) => {
                    if(name === 'Nomenclature'){
                        const [norme, sousNorme] = attributes['V'].split('-')
                        resolve({norme, sousNorme})
                    }
                })
            }
        })
    })

    const annéeP = new Promise((resolve) => {
        
        p.on('opentag', (name) => {
            if(name === 'BlocBudget'){
                p.on('opentag', (name, attributes) => {
                    if(name === 'Exer'){
                        resolve(attributes['V'])
                    }
                })
            }
        })

    })

    return new Promise((resolve, reject) => {
        p.on('error', reject)

        docBudgStream.pipe(p)

        resolve(Promise.all([normeP, annéeP])
            .then(([{norme, sousNorme}, année]) => {
                p.end()
                return {norme, sousNorme, année}
            })
        )
    })
    
}