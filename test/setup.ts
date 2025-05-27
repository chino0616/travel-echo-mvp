import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { jest } from '@jest/globals';

interface FFmpegMock {
  input: jest.Mock;
  outputOptions: jest.Mock;
  save: jest.Mock<void, [string, (error: Error | null) => void]>;
}

// 模擬 FFmpeg
jest.mock('fluent-ffmpeg', () => {
  return jest.fn().mockImplementation((): FFmpegMock => ({
    input: jest.fn().mockReturnThis(),
    outputOptions: jest.fn().mockReturnThis(),
    save: jest.fn().mockImplementation((path: string, callback: (error: Error | null) => void) => callback(null)),
  }));
});

// 模擬文件系統
jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  readFile: jest.fn(),
  unlink: jest.fn(),
  mkdir: jest.fn(),
}));

// 全局設置
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// 清理測試環境
afterEach(() => {
  jest.clearAllMocks();
}); 