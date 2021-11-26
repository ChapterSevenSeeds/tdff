import prettyBytes from 'pretty-bytes';
import prettyNum from 'pretty-num';
import { ParserStatusMessages } from './enums';

function extractLeadingNumber(input) {
    return +/^\d+/.exec(input)[0];
}

export default class Session {
    mode;
    rootFolder;
    outputLocation;
    minimumFileSize;
    maximumFileSize;
    startTime;
    endTime;
    foldersScanned;
    filesScanned;
    bytesScanned;
    extensionsExcluded;
    extensionsIncluded;
    foldersExcluded;
    fileNamesExcluded;
    totalDuplicates;
    totalDuplicatesSize;

    groups = [];

    /**
     * Constructs a new Session object.
     * @param {string[]} inputFile The lines of the input file.
     */
    constructor(inputFile) {
        if (inputFile.splice(0, 1)[0] !== "-----TDFF RESULT FILE-----") {
            throw new Error("Input file is not a TDFF result file.");
        }
    
        const settingsLines = inputFile.splice(0, 14);
    
        for (const line of settingsLines) {
            const indexOfFirstColon = line.indexOf(':');
            const splitLine = [line.substring(0, indexOfFirstColon), line.substring(indexOfFirstColon + 1)].map(x => x.trim());
            switch (splitLine[0]) {
                case "Mode":
                    this.mode = splitLine[1];
                    break;
                case "Root folder": 
                    this.rootFolder = splitLine[1];
                    break;
                case "Output location":
                    this.outputLocation = splitLine[1];
                    break;
                case "Minimum file size":
                    this.minimumFileSize = prettyBytes(extractLeadingNumber(splitLine[1]));
                    break;
                case "Maximum file size":
                    this.maximumFileSize = prettyBytes(extractLeadingNumber(splitLine[1]));
                    break;
                case "Start time":
                    this.startTime = new Date(splitLine[1]).toLocaleString();
                    break;
                case "End time":
                    this.endTime = new Date(splitLine[1]).toLocaleString();
                    break;
                case "Folders scanned":
                    this.foldersScanned = prettyNum(+splitLine[1], {thousandsSeparator: ','});
                    break;
                case "Files scanned":
                    this.filesScanned = prettyNum(+splitLine[1], {thousandsSeparator: ','});
                    break;
                case "Bytes scanned":
                    this.bytesScanned = prettyBytes(+splitLine[1]);
                    break;
                case "Extensions excluded":
                    this.extensionsExcluded = splitLine[1] === "NONE" ? [] : splitLine[1].split(";");
                    break;
                case "Extensions included (except those explicitly excluded)":
                    this.extensionsIncluded = splitLine[1] === "NONE" ? [] : splitLine[1].split(";");
                    break;
                case "Folders excluded":
                    this.foldersExcluded = splitLine[1] === "NONE" ? [] : splitLine[1].split(";");
                    break;
                case "File names excluded":
                    this.fileNamesExcluded = splitLine[1] === "NONE" ? [] : splitLine[1].split(";");
                    break;
            }
        }

        postMessage({
            type: ParserStatusMessages.CompletionUpdate,
            value: 20
        });

        let statusUpdateCount = 0;
        const fileLines = inputFile.splice(0, inputFile.length - 2);
        for (let i = 0; i < fileLines.length; ++i) {
            if (fileLines[i][0] === "G") {
                this.groups.push([]); // New group.
            } else {
                this.groups[this.groups.length - 1].push(fileLines[i].substring(5)); // Remove FILE prefix.
            }

            if (statusUpdateCount++ % 5000 === 0) {
                postMessage({
                    type: ParserStatusMessages.CompletionUpdate,
                    value: statusUpdateCount * 75 / fileLines.length + 20
                });
            }
        }

        for (const lastStat of inputFile) {
            const splitLine = lastStat.split(":").map(x => x.trim());
            
            switch (splitLine[0]) {
                case "Total duplicates":
                    this.totalDuplicates = prettyNum(+splitLine[1], {thousandsSeparator: ','});
                    break;
                case "Total duplicates size":
                    this.totalDuplicatesSize = prettyBytes(+splitLine[1]);
                    break;
            }
        }

        postMessage({
            type: ParserStatusMessages.CompletionUpdate,
            value: 100
        });
    }
}