import { readFileSync } from 'original-fs';
import { ParserStatusMessages } from '../models/enums';
import Session from '../models/session';

addEventListener('message', e => {
    const lines = Array.from(readFileSync(e.data)).map(x => String.fromCharCode(x)).join("").split(/\r?\n/).filter(x => x);
    postMessage({
        type: ParserStatusMessages.CompletionUpdate,
        value: 10
    });

    postMessage({
        type: ParserStatusMessages.Finished,
        value: new Session(lines)
    });
});