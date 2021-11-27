addEventListener('message', e => {
    for (const group of e.data) {
        for (let i = 0; i < group.length; ++i) {
            if (i > 0) {
                group[i].selected = true;
            }
        }
    }

    postMessage(e.data);
});