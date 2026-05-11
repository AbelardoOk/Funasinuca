import { describe, expect, it } from 'bun:test';
import { checkRateLimit } from '../../lib/rateLimit';

describe('checkRateLimit', () => {
  it('não bloqueia dentro do limite', () => {
    const ip = '192.168.0.1';
    for (let i = 0; i < 9; i++) checkRateLimit(ip, 10, 60000);
    expect(checkRateLimit(ip, 10, 60000)).toBe(false);
  });

  it('bloqueia ao exceder o limite', () => {
    const ip = '192.168.0.2';
    for (let i = 0; i < 10; i++) checkRateLimit(ip, 10, 60000);
    expect(checkRateLimit(ip, 10, 60000)).toBe(true);
  });
});
