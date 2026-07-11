export const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
  bgCyan: "\x1b[46m",
  bgBlack: "\x1b[40m",
};

export const ui = {
  success: (msg: string) =>
    console.log(`${colors.green}[OK] ${msg}${colors.reset}`),
  error: (msg: string) =>
    console.log(`${colors.red}[ERROR] ${msg}${colors.reset}`),
  info: (msg: string) =>
    console.log(`${colors.cyan}[INFO] ${msg}${colors.reset}`),
  warn: (msg: string) =>
    console.log(`${colors.yellow}[WARN] ${msg}${colors.reset}`),
  heading: (msg: string) =>
    console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`),
  divider: () =>
    console.log(
      `${colors.gray}--------------------------------------------------${colors.reset}`,
    ),
};
