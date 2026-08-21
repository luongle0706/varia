import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  formatDuration,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toPascalCase,
} from '../src/format';

describe('Format Utilities', () => {
  it('should format bytes properly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('should format duration properly', () => {
    expect(formatDuration(45)).toBe('00:45');
    expect(formatDuration(125)).toBe('02:05');
    expect(formatDuration(3665)).toBe('01:01:05');
  });

  it('should convert cases correctly', () => {
    expect(toCamelCase('hello-world_test')).toBe('helloWorldTest');
    expect(toSnakeCase('helloWorldTest')).toBe('hello_world_test');
    expect(toKebabCase('helloWorldTest')).toBe('hello-world-test');
    expect(toPascalCase('hello-world_test')).toBe('HelloWorldTest');
  });
});
