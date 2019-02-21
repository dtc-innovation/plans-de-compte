import { open, read, close } from 'fs-extra';


export default function(filename){
    return open(filename, 'r')
    .then(fd => {
        let result;
        const buffer = Buffer.alloc(500);

        return read(fd, buffer, 0, buffer.length, 0)
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
        .then(() => close(fd))
        .then(() => result)
    })

}