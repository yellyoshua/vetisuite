import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import {ACCOUNT_FIXTURES} from '@/api/__tests__/helpers/profiles.js';
import {claimCode, issueCode, peekCode, resolveRedirectUri} from '@/modules/oauth/oauth.service.js';

const OWNER_USER = '662e8400-e29b-41d4-a716-446655440001';
const BROWSER = {context: {ip: '203.0.113.5', userAgent: 'navegador-a'}};

describe('modules/oauth', () => {
  beforeEach(async () => {
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolveRedirectUri compara por igualdad exacta', () => {
    expect(resolveRedirectUri()).toBe('http://localhost:5173/oauth/vetisuite');
    expect(resolveRedirectUri('http://localhost:5173/oauth/vetisuite')).toBe('http://localhost:5173/oauth/vetisuite');
    expect(() => resolveRedirectUri('http://localhost:5173@evil.test/oauth/vetisuite')).toThrow();
    expect(() => resolveRedirectUri('http://localhost:5173/oauth/vetisuite/../x')).toThrow();
  });

  it('un code vencido no se valida ni se canjea', async () => {
    const code = await issueCode(OWNER_USER, {context: BROWSER});

    vi.useFakeTimers({toFake: ['Date']});
    vi.setSystemTime(new Date(Date.now() + 61000));

    await expect(peekCode(code, {context: BROWSER})).rejects.toEqual({error: 'errors.invalid_grant', status: 400});
    await expect(claimCode(code, {context: BROWSER})).rejects.toEqual({error: 'errors.invalid_grant', status: 400});
  });

  it('el canje con un redirect_uri distinto al del code es invalid_grant', async () => {
    const code = await issueCode(OWNER_USER, {context: BROWSER});

    await expect(claimCode(code, {redirectUri: 'http://otra.test/oauth', context: BROWSER})).rejects.toEqual({error: 'errors.invalid_grant', status: 400});
  });

  it('el canje devuelve token, vida de la sesión y perfil', async () => {
    const code = await issueCode(OWNER_USER, {context: BROWSER});

    const claimed = await claimCode(code, {redirectUri: 'http://localhost:5173/oauth/vetisuite', context: BROWSER});

    expect(claimed.token).toMatch(/^[\w-]+\.[\w-]+$/);
    expect(claimed.expires_in).toBe(172800);
    expect(claimed.profile.user.id).toBe(OWNER_USER);
  });
});
