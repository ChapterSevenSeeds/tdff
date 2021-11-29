import trash from 'trash';
import { unlink } from 'original-fs';

addEventListener('message', async e => {
    await Promise.all([e.data.filter(x => x.selected).map(x => new Promise(async resolve => {
            const file = x;

            // First try to send it to the trash. Then try to delete it (if it was sent to the trash, nothing should happen).
            await trash([file]); 
            debugger;
            unlink(file, err => {
                console.log(err);

                resolve();
            });
        })
    )]);

    postMessage(0);
});