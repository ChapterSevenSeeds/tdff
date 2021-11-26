import os from 'os';

addEventListener('message', e => {
    const results = [];
    const cpuCount = os.cpus().length;
    const threads = [];
    const threadItemCount = Math.ceil(e.data.items.length / cpuCount);
    
    for (let i = 0; i < cpuCount; ++i) {
        threads.push(new Worker(new URL('../tools/filterSlave.js', import.meta.url)));
        threads[i].onmessage = e => {
            results.push(...e.data);
            threads[i].terminate();
            threads[i] = null;

            if (!threads.some(x => x)) {
                postMessage(results);
            }
        };

        threads[i].postMessage({
            token: e.data.token,
            items: e.data.items.splice(0, threadItemCount)
        });
    }
});