import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, OWNER, SUPERADMIN} from './helpers/profiles.js';
import organizationsGet from '@/api/organizations.get.js';

describe('/api/organizations', () => {
  beforeEach(async () => {
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('el superadmin lista las organizaciones y busca por nombre', async () => {
    const {response} = await organizationsGet(buildAuthedEvent({profile: SUPERADMIN}));
    const searched = await organizationsGet(buildAuthedEvent({url: '/?search=Norte', profile: SUPERADMIN}));

    expect(response.map((organization) => organization.slug).sort()).toEqual(['clinica-norte', 'clinica-sur', 'vetisuite']);
    expect(searched.response.map((organization) => organization.slug)).toEqual(['clinica-norte']);
  });

  it('un dueño no lista organizaciones', async () => {
    const event = buildAuthedEvent({profile: OWNER});

    await organizationsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('rechaza una clave no declarada', async () => {
    const event = buildAuthedEvent({url: '/?archivedAt=2020-01-01', profile: SUPERADMIN});

    await organizationsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
