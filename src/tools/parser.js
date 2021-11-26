import { readFileSync } from 'original-fs';
import { WorkerMessageTypes } from '../models/enums';
import Session from '../models/session';

addEventListener('message', e => {
    const lines = Array.from(readFileSync(e.data)).map(x => String.fromCharCode(x)).join("").split(/\r?\n/).filter(x => x);
    postMessage({
        type: WorkerMessageTypes.CompletionUpdate,
        value: 10
    });

    postMessage({
        type: WorkerMessageTypes.Finished,
        value: new Session(lines)
    });
});