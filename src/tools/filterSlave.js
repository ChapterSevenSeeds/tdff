addEventListener('message', e => {
    const results = [];

    for (const group of e.data.items) {
        const groupResults = [];
        let containsAtLeastOne = false;
        for (const file of group) {
            if (e.data.token.test(file.file)) {
                groupResults.push(file);
                containsAtLeastOne = true;
            } else {
                groupResults.push({
                    file: file.file,
                    filtered: true
                });
            }
        }

        if (containsAtLeastOne) results.push(groupResults);
    }

    postMessage(results);
});