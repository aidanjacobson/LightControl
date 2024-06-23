/*
log_entry {
    body: Object
    ip: String
    method: String
    origin_id: String
    path: String
    time: Number
}

options {
    body: {
        key: FilterOption
    }
    ip: FilterOption
    method: FilterOption
    origin_id: FilterOption
    path: FilterOption
    time: FilterOption
}

FilterOption {
    ?exact: Value|Array<Value>
    ?regex: RegExp|Array<RegExp>
    ?contains: String|Array<String>
    ?between: {
        from: Number|Date
        to: Number|Date
    }
}

*/

async function filterLog(options) {
    var entries = await apiGet("/getlog");
    return entries.filter(entry=>filterOptionsMatchEntry(options, entry));
}

function filterOptionsMatchEntry(options, entry) {
    for (key in options) {
        if (key == "body") {
            for (bodyKey in options.body) {
                if (typeof entry.body === "undefined") return false;
                if (typeof entry.body[bodyKey] === "undefined" || ! filterOptionMatchesValue(options.body[bodyKey], entry.body[bodyKey])) {
                    return false;
                }
            }
        } else if (! filterOptionMatchesValue(options[key], entry[key])) {
            return false;
        }
    }
    return true;
}

function filterOptionMatchesValue(option, value) {
    if (option.exact) {
        if (option.exact instanceof Array) {
            return option.exact.some(exactValue=>exactValue==value);
        } else {
            return option.exact == value;
        }
    }
    if (option.regex) {
        if (option.regex instanceof Array) {
            return option.regex.some(regexValue=>regexValue.test(value));
        } else {
            return option.regex.test(value);
        }
    }
    if (option.contains) {
        if (option.contains instanceof Array) {
            return option.contains.some(containValue=>value.indexOf(containValue) != -1);
        } else {
            return value.indexOf(option.contains) != -1;
        }
    }
    if (option.between) {
        var start = option.between.from;
        var end = option.between.to;
        if (start instanceof Date) start = start.getTime();
        if (end instanceof Date) end = end.getTime();
        return value >= start && value <= end;
    }
}