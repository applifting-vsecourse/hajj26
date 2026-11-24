// Example unit test — the pattern to copy for your own services.
// The repository is mocked, so the test exercises the service in isolation.
import { Quack } from '@/modules/quack/domain/quack';
import { QuackRepository } from '@/modules/quack/repositories/quack.repository';
import { Identity } from '@/shared/auth/domain/identity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { QuacksService } from './quacks.service';

const aQuack = (overrides: Partial<Quack> = {}): Quack => ({
  id: 'q1',
  text: 'quack quack',
  mood: null,
  userId: 'u1',
  createdAt: new Date('2026-01-01T12:00:00Z'),
  updatedAt: new Date('2026-01-01T12:00:00Z'),
  user: { id: 'u1', name: 'Caffeinated Duck', username: 'CaffeinatedDuck' },
  ...overrides,
});

describe('QuacksService', () => {
  it('returns quacks from the repository', async () => {
    const quacks = [aQuack()];
    const repository = mock<QuackRepository>();
    repository.getQuacks.mockResolvedValue(quacks);

    const service = new QuacksService(repository);

    await expect(service.getQuacks()).resolves.toEqual(quacks);
    expect(repository.getQuacks).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['bread', 'bread'],
    ['  bread  ', 'bread'],
    ['@BreadCritic', 'BreadCritic'],
    ['', undefined],
    ['   ', undefined],
    ['@', undefined],
    [undefined, undefined],
  ])('normalises search %p to %p', async (input, expected) => {
    const repository = mock<QuackRepository>();
    repository.getQuacks.mockResolvedValue([]);

    const service = new QuacksService(repository);
    await service.getQuacks({ search: input });

    expect(repository.getQuacks).toHaveBeenCalledWith({
      search: expected,
      authorId: undefined,
    });
  });

  it('creates a quack owned by the signed-in user', async () => {
    const created = aQuack({ id: 'q2', text: 'hello' });
    const repository = mock<QuackRepository>();
    repository.createQuack.mockResolvedValue(created);

    const service = new QuacksService(repository);
    const user = { id: 'u1' } as Identity;

    await expect(service.createQuack(user, { text: 'hello' })).resolves.toEqual(
      created,
    );
    // the author comes from the session, not from the caller's payload
    expect(repository.createQuack).toHaveBeenCalledWith({
      text: 'hello',
      mood: null,
      userId: 'u1',
    });
  });

  it('passes the chosen mood through to the repository', async () => {
    const created = aQuack({ id: 'q3', text: 'lol', mood: 'silly' });
    const repository = mock<QuackRepository>();
    repository.createQuack.mockResolvedValue(created);

    const service = new QuacksService(repository);
    const user = { id: 'u1' } as Identity;

    await expect(
      service.createQuack(user, { text: 'lol', mood: 'silly' }),
    ).resolves.toEqual(created);
    expect(repository.createQuack).toHaveBeenCalledWith({
      text: 'lol',
      mood: 'silly',
      userId: 'u1',
    });
  });

  it('narrows the feed to one author when asked', async () => {
    const repository = mock<QuackRepository>();
    repository.getQuacks.mockResolvedValue([]);

    const service = new QuacksService(repository);
    await service.getQuacks({ search: 'bread', authorId: 'u1' });

    expect(repository.getQuacks).toHaveBeenCalledWith({
      search: 'bread',
      authorId: 'u1',
    });
  });

  describe('deleteQuack', () => {
    const user = { id: 'u1' } as Identity;

    it("deletes the signed-in user's own quack", async () => {
      const repository = mock<QuackRepository>();
      repository.deleteOwnQuack.mockResolvedValue(true);

      const service = new QuacksService(repository);

      await expect(service.deleteQuack(user, 'q1')).resolves.toBeUndefined();
      // ownership is checked against the session user, inside the delete itself
      expect(repository.deleteOwnQuack).toHaveBeenCalledWith({
        id: 'q1',
        userId: 'u1',
      });
    });

    it("refuses to delete someone else's quack", async () => {
      const repository = mock<QuackRepository>();
      repository.deleteOwnQuack.mockResolvedValue(false);
      repository.getQuackById.mockResolvedValue(aQuack({ userId: 'u2' }));

      const service = new QuacksService(repository);

      await expect(service.deleteQuack(user, 'q1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('reports a quack that does not exist', async () => {
      const repository = mock<QuackRepository>();
      repository.deleteOwnQuack.mockResolvedValue(false);
      repository.getQuackById.mockResolvedValue(null);

      const service = new QuacksService(repository);

      await expect(service.deleteQuack(user, 'nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
