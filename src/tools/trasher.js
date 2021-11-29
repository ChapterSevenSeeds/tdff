import { shell } from 'electron';
import { unlinkSync } from 'original-fs';

addEventListener('message', async e => {
    await Promise.all([e.data.filter(x => x.selected).map(x => new Promise(async resolve => {
            const file = x.file;

            // First try to send it to the trash. Then try to delete it (if it was sent to the trash, nothing should happen).
            if (!shell.moveItemToTrash(file)) {
                unlinkSync(file);
            }

            resolve();
        })
    )]);

    postMessage(0);
});