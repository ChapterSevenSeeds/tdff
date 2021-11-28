export default function extractLeadingNumber(input) {
    return +/^\d+/.exec(input)[0];
}