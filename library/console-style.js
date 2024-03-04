// STYLING FOR CONSOLE LOGS
// =============================================================================
// =============================================================================

// use ANSI escape codes to style console logs

// non bold and italic

// ANSI escape codes for text colors
const ANSI_RESET = '\x1b[0m';

// Basic colors
const black = '\x1b[30m';
const red = '\x1b[31m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const magenta = '\x1b[35m';
const cyan = '\x1b[36m';
const white = '\x1b[37m';

// Bright colors
const brightBlack = '\x1b[90m';
const brightRed = '\x1b[91m';
const brightGreen = '\x1b[92m';
const brightYellow = '\x1b[93m';
const brightBlue = '\x1b[94m';
const brightMagenta = '\x1b[95m';
const brightCyan = '\x1b[96m';
const brightWhite = '\x1b[97m';

// Background colors
const bgBlack = '\x1b[40m';
const bgRed = '\x1b[41m';
const bgGreen = '\x1b[42m';
const bgYellow = '\x1b[43m';
const bgBlue = '\x1b[44m';
const bgMagenta = '\x1b[45m';
const bgCyan = '\x1b[46m';
const bgWhite = '\x1b[47m';

// Bright background colors
const bgBrightBlack = '\x1b[100m';
const bgBrightRed = '\x1b[101m';
const bgBrightGreen = '\x1b[102m';
const bgBrightYellow = '\x1b[103m';
const bgBrightBlue = '\x1b[104m';
const bgBrightMagenta = '\x1b[105m';
const bgBrightCyan = '\x1b[106m';
const bgBrightWhite = '\x1b[107m';

// Bold and italic
const bold = '\x1b[1m';
const italic = '\x1b[3m';
const underline = '\x1b[4m';

// WARN GOOD ERROR banner

const warn = `${bgYellow}${bold}${white}WARN:${ANSI_RESET}`;
const good = `${bgGreen}${bold}${white}GOOD:${ANSI_RESET}`;
const error = `${bgRed}${bold}${white}ERROR:${ANSI_RESET}`;
const info = `${bgBlue}${bold}${white}INFO:${ANSI_RESET}`;

module.exports = {
    basic: {
        black,
        red,
        green,
        yellow,
        blue,
        magenta,
        cyan,
        white
    },
    bright: {
        black: brightBlack,
        red: brightRed,
        green: brightGreen,
        yellow: brightYellow,
        blue: brightBlue,
        magenta: brightMagenta,
        cyan: brightCyan,
        white: brightWhite
    },
    background: {
        black: bgBlack,
        red: bgRed,
        green: bgGreen,
        yellow: bgYellow,
        blue: bgBlue,
        magenta: bgMagenta,
        cyan: bgCyan,
        white: bgWhite
    },
    bgBright: {
        black: bgBrightBlack,
        red: bgBrightRed,
        green: bgBrightGreen,
        yellow: bgBrightYellow,
        blue: bgBrightBlue,
        magenta: bgBrightMagenta,
        cyan: bgBrightCyan,
        white: bgBrightWhite
    },
    style: {
        bold,
        italic
    },
    reset: ANSI_RESET,
    warning: {
        warn,
        good,
        error,
        info
    }
};
