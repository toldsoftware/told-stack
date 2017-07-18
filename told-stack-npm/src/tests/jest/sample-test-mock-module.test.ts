import 'jest';

// Mocks must be above imports
jest.mock('./sample-module', () => ({
    constValue: 'mocked-abc',
    constObject: {
        a: 'mocked-abc'
    },
    fun: () => 'mocked-abc',
}));

import { run } from './sample-test-mock-module';

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
