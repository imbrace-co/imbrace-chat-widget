export function isEmpty(e) {
    switch (e) {
        case '':
        case null:
        case undefined:
        case typeof e === 'undefined':
        case e === 'undefined':
            return true;
        default:
            return false;
    }
}

export function isNull(e) {
    return e === null || e === undefined || e === 'undefined' || typeof e === 'undefined';
}

export function isNullString(e) {
    return e === null || e === undefined || e === 'undefined' || typeof e === 'undefined' || e === '';
}

export function isNullArray(e) {
    return e === null || e === undefined || e === 'undefined' || typeof e === 'undefined' || e.length === 0;
}

export function isEmptyDisplay(e) {
    switch (e) {
        case '':
        case null:
        case undefined:
        case typeof e === 'undefined':
        case e === 'undefined':
            return '';
        default:
            return e;
    }
}
