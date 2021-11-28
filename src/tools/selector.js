import { flatten, groupBy } from "lodash";
import { SelectorCommands } from "../models/enums";
import Session from '../models/session';

function allDupsMatchingFilter(group) {
    clear(group); // Wipe out all previous selections.

    let i = 0;
    for (; i < group.length && !group[i].filtered; ++i) {
        group[i].selected = true;
    }

    if (i === group.length) group[0].selected = false; // If all were selected, unselect the first one.
}

function allDups(group) {
    clear(group); // Wipe out all previous selections.

    for (let i = 0; i < group.length; ++i) {
        if (i > 0) {
            group[i].selected = true;
        }
    }
}

function invert(group) {
    for (const file of group) file.selected = !file.selected;
}

function clear(group) {
    for (const file of group) file.selected = false;
}

addEventListener('message', e => {
    const groups = Object.values(groupBy(e.data.files, 'group'));

    let callback;
    switch (e.data.type) {
        case SelectorCommands.DuplicatesMatchingFilter:
            callback = allDupsMatchingFilter;
            break;
        case SelectorCommands.AllDuplicates:
            callback = allDups;
            break;
        case SelectorCommands.Invert:
            callback = invert;
            break;
        case SelectorCommands.Clear:
            callback = clear;
            break;
    }

    for (const group of groups) {
        callback(group);
    }

    postMessage(flatten(Session.sortFiles(groups, true)));
});