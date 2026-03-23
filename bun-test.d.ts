declare module "bun:test" {
  export function describe(name: string, fn: () => void | Promise<void>): void;
  export interface TestFunction {
    (name: string, fn: () => void | Promise<void>): void;
    each(cases: readonly any[]): (name: string, fn: (...args: any[]) => void | Promise<void>) => void;
  }
  export const test: TestFunction;
  export const it: TestFunction;
  export function expect<T = unknown>(value: T): any;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;
}
