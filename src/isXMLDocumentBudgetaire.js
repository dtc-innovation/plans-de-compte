import { open } from 'fs/promises';


export default function(filename){
    return open(filename, 'r')
    .then(fh => {
        let result;
        const buffer = Buffer.alloc(500);

        return fh.read(buffer, 0, buffer.length, 0)
        .then(({buffer}) => {
            const str = buffer.toString()

            result = str.includes('<?xml') && str.includes('DocumentBudgetaire')
        })
        .catch(err => {
            if(err.code === 'EISDIR'){
                result = false;
                return;
            }
            else{
                throw err;
            }
        })
        .then(() => fh.close())
        .then(() => result)
    })

}