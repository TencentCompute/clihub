import * as assert from 'assert';
import { parseArgumentsString, ArgumentParserLogger, hasUnmatchedQuotes } from '../../argument-parser';

function createLogger(): { logger: ArgumentParserLogger; warnings: string[] } {
  const warnings: string[] = [];
  return {
    warnings,
    logger: {
      warn: (message: string) => warnings.push(message),
    },
  };
}

describe('Unit: argument-parser', () => {
  it('空字符串应返回空数组', () => {
    const { logger, warnings } = createLogger();
    const result = parseArgumentsString('', logger);
    assert.deepStrictEqual(result, []);
    assert.strictEqual(warnings.length, 0);
  });

  it('仅空白字符应返回空数组', () => {
    const result = parseArgumentsString('   \t  ');
    assert.deepStrictEqual(result, []);
  });

  it('单个参数应保持不变', () => {
    const result = parseArgumentsString('--yolo');
    assert.deepStrictEqual(result, ['--yolo']);
  });

  it('多个参数应按空格拆分', () => {
    const result = parseArgumentsString('--flag value --another test');
    assert.deepStrictEqual(result, ['--flag', 'value', '--another', 'test']);
  });

  it('双引号包裹的参数应保留空格', () => {
    const { logger, warnings } = createLogger();
    const result = parseArgumentsString('--flag "value with spaces"', logger);
    assert.deepStrictEqual(result, ['--flag', 'value with spaces']);
    assert.strictEqual(warnings.length, 0);
  });

  it('单引号包裹的参数应保留空格', () => {
    const result = parseArgumentsString("--flag 'single quoted value'");
    assert.deepStrictEqual(result, ['--flag', 'single quoted value']);
  });

  it('不同类型引号可混用', () => {
    const result = parseArgumentsString(`--message "say 'hello' world"`);
    assert.deepStrictEqual(result, ['--message', "say 'hello' world"]);
  });

  it('应处理转义空格', () => {
    const result = parseArgumentsString('--path /Users/dev\\ user/project');
    assert.deepStrictEqual(result, ['--path', '/Users/dev user/project']);
  });

  it('应处理转义引号', () => {
    const result = parseArgumentsString('--json "{\\"key\\":\\"value\\"}"');
    assert.deepStrictEqual(result, ['--json', '{"key":"value"}']);
  });

  it('重复空格不会生成空参数', () => {
    const result = parseArgumentsString('--flag   value');
    assert.deepStrictEqual(result, ['--flag', 'value']);
  });

  it('前后空格应被忽略', () => {
    const result = parseArgumentsString('   --flag value   ');
    assert.deepStrictEqual(result, ['--flag', 'value']);
  });

  it('未闭合双引号应记录警告', () => {
    const { logger, warnings } = createLogger();
    const result = parseArgumentsString('--flag "unterminated', logger);
    assert.deepStrictEqual(result, ['--flag', 'unterminated']);
    assert.strictEqual(warnings.length, 1);
    assert.ok(warnings[0].includes('Unmatched " quote'));
  });

  it('未闭合单引号应记录警告', () => {
    const { logger, warnings } = createLogger();
    const result = parseArgumentsString("--flag 'unterminated", logger);
    assert.deepStrictEqual(result, ['--flag', 'unterminated']);
    assert.strictEqual(warnings.length, 1);
    assert.ok(warnings[0].includes("Unmatched ' quote"));
  });

  it('未提供 logger 时不会抛出异常', () => {
    assert.doesNotThrow(() => {
      parseArgumentsString('--flag "unterminated');
    });
  });

  it('返回结果应为新数组', () => {
    const expected = ['--flag', 'value'];
    const first = parseArgumentsString('--flag value');
    first.push('mutation');
    const second = parseArgumentsString('--flag value');
    assert.deepStrictEqual(second, expected);
  });

  describe('hasUnmatchedQuotes()', () => {
    it('匹配的引号应返回 false', () => {
      assert.strictEqual(hasUnmatchedQuotes('--flag "value"'), false);
      assert.strictEqual(hasUnmatchedQuotes("--flag 'value'"), false);
    });

    it('未闭合的引号应返回 true', () => {
      assert.strictEqual(hasUnmatchedQuotes('--flag "value'), true);
      assert.strictEqual(hasUnmatchedQuotes("--flag 'value"), true);
    });

    it('转义字符不会误判', () => {
      assert.strictEqual(hasUnmatchedQuotes('--json "{\\"key\\":\\"value\\"}"'), false);
      assert.strictEqual(hasUnmatchedQuotes("--message 'it\\'s fine'"), false);
    });
  });
});
