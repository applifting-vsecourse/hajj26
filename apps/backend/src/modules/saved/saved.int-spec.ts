// Saved over HTTP against the real backend and a test database (see
// src/test/integration). Each test starts from empty tables. Case IDs (S1, S2, …) refer to cases.md in the repo root.
import { ApiClient } from '@/test/integration/api-client';
import { connectTestApi, TestApi } from '@/test/integration/test-api';

type QuackJson = {
  id: string;
  text: string;
  userId: string;
  isSaved?: boolean;
};

describe('Saved (integration)', () => {
  let testApi: TestApi;
  let alice: ApiClient;
  let bob: ApiClient;

  const postQuack = async (
    author: ApiClient,
    text: string,
  ): Promise<string> => {
    const { status, body } = await author.post<QuackJson>('/quacks', { text });
    expect(status).toBe(201);
    return body.id;
  };

  const savedIds = async (user: ApiClient): Promise<string[]> => {
    const { status, body } = await user.get<QuackJson[]>('/saved');
    expect(status).toBe(200);
    return body.map((quack) => quack.id);
  };

  beforeAll(() => {
    testApi = connectTestApi();
  });

  afterAll(async () => {
    await testApi.close();
  });

  beforeEach(async () => {
    await testApi.reset();
    alice = await testApi.signUp('Alice');
    bob = await testApi.signUp('Bob');
  });

  it('S1: a saved quack shows up in Saved', async () => {
    const quackId = await postQuack(bob, 'bread is overrated');

    expect((await alice.put(`/saved/${quackId}`)).status).toBe(204);

    const { status, body } = await alice.get<QuackJson[]>('/saved');
    expect(status).toBe(200);
    expect(body).toEqual([
      expect.objectContaining({
        id: quackId,
        text: 'bread is overrated',
        userId: bob.userId,
      }),
    ]);
  });

  it('S2: saving twice keeps the quack in Saved once', async () => {
    const quackId = await postQuack(bob, 'quack');

    expect((await alice.put(`/saved/${quackId}`)).status).toBe(204);
    expect((await alice.put(`/saved/${quackId}`)).status).toBe(204);

    expect(await savedIds(alice)).toEqual([quackId]);
  });

  it('S3: someone else’s saves do not show up in my Saved', async () => {
    const quackId = await postQuack(bob, 'quack');
    expect((await alice.put(`/saved/${quackId}`)).status).toBe(204);

    expect(await savedIds(bob)).toEqual([]);
  });

  it('S4: Saved cannot be requested for another user', async () => {
    const quackId = await postQuack(bob, 'quack');
    expect((await alice.put(`/saved/${quackId}`)).status).toBe(204);

    const { status } = await bob.get(`/saved?userId=${alice.userId}`);
    expect(status).toBe(400);
  });

  it('S5: an unsaved quack leaves Saved, and unsaving again is fine', async () => {
    const quackId = await postQuack(bob, 'quack');
    expect((await alice.put(`/saved/${quackId}`)).status).toBe(204);

    expect((await alice.delete(`/saved/${quackId}`)).status).toBe(204);
    expect(await savedIds(alice)).toEqual([]);

    expect((await alice.delete(`/saved/${quackId}`)).status).toBe(204);
  });

  it('S6: Saved lists the most recently saved quack first', async () => {
    // Written in one order, saved in the other — so the order can only come
    // from when they were saved, not from when they were written.
    const older = await postQuack(bob, 'written first');
    const newer = await postQuack(bob, 'written second');

    expect((await alice.put(`/saved/${newer}`)).status).toBe(204);
    expect((await alice.put(`/saved/${older}`)).status).toBe(204);

    expect(await savedIds(alice)).toEqual([older, newer]);
  });

  it('S7: saving a quack that does not exist is a 404', async () => {
    const { status } = await alice.put('/saved/does-not-exist');
    expect(status).toBe(404);
  });

  it('S8: an anonymous visitor can neither save, unsave nor read Saved', async () => {
    const quackId = await postQuack(bob, 'quack');
    const { anonymous } = testApi;

    expect((await anonymous.put(`/saved/${quackId}`)).status).toBe(401);
    expect((await anonymous.delete(`/saved/${quackId}`)).status).toBe(401);
    expect((await anonymous.get('/saved')).status).toBe(401);
  });

  it('S9: a quack its author deletes disappears from Saved', async () => {
    const quackId = await postQuack(bob, 'regrettable take');
    expect((await alice.put(`/saved/${quackId}`)).status).toBe(204);

    expect((await bob.delete(`/quacks/${quackId}`)).status).toBe(204);

    expect(await savedIds(alice)).toEqual([]);
  });

  it('S10: you can save your own quack', async () => {
    const quackId = await postQuack(alice, 'my own wisdom');

    expect((await alice.put(`/saved/${quackId}`)).status).toBe(204);
    expect(await savedIds(alice)).toEqual([quackId]);
  });

  it('S11: the feed marks quacks I saved, and only for me', async () => {
    const saved = await postQuack(bob, 'keep this');
    const notSaved = await postQuack(bob, 'skip this');
    expect((await alice.put(`/saved/${saved}`)).status).toBe(204);

    const isSavedFor = async (user: ApiClient): Promise<unknown> => {
      const { body } = await user.get<QuackJson[]>('/quacks');
      return Object.fromEntries(body.map((q) => [q.id, q.isSaved]));
    };

    expect(await isSavedFor(alice)).toEqual({
      [saved]: true,
      [notSaved]: false,
    });
    expect(await isSavedFor(bob)).toEqual({
      [saved]: false,
      [notSaved]: false,
    });
  });

  it('S12: empty Saved is an empty list', async () => {
    const { status, body } = await alice.get('/saved');
    expect(status).toBe(200);
    expect(body).toEqual([]);
  });
});
