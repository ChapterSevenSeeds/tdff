addEventListener('message', e => {
    const results = [];

    for (const group of e.data.items) {
        if (group.some(x => x.includes(e.data.token))) {
            results.push(group);
            continue;
        }
    }

    postMessage(results);
});