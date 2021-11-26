import Session from '../models/session';
import os from 'os';
import { WorkerMessageTypes } from '../models/enums';

addEventListener('message', e => {
    const results = [];
    const cpuCount = Math.max(os.cpus().length - 2, 1); // Leave one thread for main and another for the renderer.
    const threads = [];
    const threadItemCount = Math.ceil(e.data.items.length / cpuCount);
    
    let threadDoneCount = 0;
    for (let i = 0; i < cpuCount; ++i) {
        threads.push(new Worker(new URL('../tools/filterSlave.js', import.meta.url)));
        threads[i].onmessage = e => {
            results.push(...e.data);
            threads[i].terminate();
            threads[i] = null;

            ++threadDoneCount;

            postMessage({
                type: WorkerMessageTypes.CompletionUpdate,
                value: threadDoneCount / cpuCount * 100
            });

            if (threadDoneCount === cpuCount) {
                postMessage({
                    type: WorkerMessageTypes.Finished,
                    value: Session.sortGroups(results)
                });
            }
        };

        threads[i].postMessage({
            token: e.data.token,
            items: e.data.items.splice(0, threadItemCount)
        });
    }
});