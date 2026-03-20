/**
 * Command-line argument parsing utilities extracted in Story 1.4.
 * Provides helpers to analyse and split custom CLI argument strings.
 */
/**
 * Logger interface used by the argument parser.
 */
export interface ArgumentParserLogger {
  warn(message: string): void;
}

/**
 * Detect whether an arguments string contains unmatched quotes.
 *
 * @param argsString - Raw arguments string from configuration
 * @returns True if there is an unmatched single or double quote
 */
export function hasUnmatchedQuotes(argsString: string): boolean {
  if (!argsString) {
    return false;
  }

  let quoteCheck: string | null = null;
  let escaped = false;

  for (let i = 0; i < argsString.length; i += 1) {
    const char = argsString[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"' || char === "'") {
      if (quoteCheck === char) {
        quoteCheck = null;
      } else if (quoteCheck === null) {
        quoteCheck = char;
      }
    }
  }

  return quoteCheck !== null;
}

/**
 * Parse command-line arguments string into array.
 * Handles quotes, spaces, and escape characters.
 *
 * @param argsString - Raw arguments string from configuration
 * @param logger - Optional logger used for warning messages (defaults to console)
 * @returns Array of individual arguments
 *
 * @example
 * parseArgumentsString('--yolo'); // ['--yolo']
 * parseArgumentsString('--flag "value with spaces"'); // ['--flag', 'value with spaces']
 * parseArgumentsString(''); // []
 */
export function parseArgumentsString(argsString: string, logger?: ArgumentParserLogger): string[] {
  if (!argsString || argsString.trim() === '') {
    return [];
  }

  const args: string[] = [];
  let current = '';
  let inQuote: string | null = null;
  let escaped = false;

  for (let i = 0; i < argsString.length; i += 1) {
    const char = argsString[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"' || char === "'") {
      if (inQuote === char) {
        inQuote = null;
      } else if (inQuote === null) {
        inQuote = char;
      } else {
        current += char;
      }
      continue;
    }

    if (char === ' ' && inQuote === null) {
      if (current.length > 0) {
        args.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    args.push(current);
  }

  if (inQuote !== null) {
    const warning = `[CLI Hub] Unmatched ${inQuote} quote in arguments: ${argsString}`;
    try {
      if (logger) {
        logger.warn(warning);
      } else {
        console.warn(warning);
      }
    } catch {
      /* ignore */
    }
  }

  return args;
}
