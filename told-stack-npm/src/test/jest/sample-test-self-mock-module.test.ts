import 'jest';
// Searches  __mock__ for a mock implementation
jest.mock('./sample-module-02');

import { run } from './sample-test-self-mock-module';

test('Can mock const value', () => {
    const { v, o, f } = run();
    expect(v).toBe('mocked-abc');
});

test('Can mock object', () => {
    const { v, o, f } = run();
    expect(o).toBe('mocked-abc');
});

test('Can mock function', () => {
    const { v, o, f } = run();
    expect(f).toBe('mocked-abc');
});
