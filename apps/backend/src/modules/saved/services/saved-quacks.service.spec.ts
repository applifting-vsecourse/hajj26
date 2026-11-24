// Rules of Saved, with both repositories mocked. What only the database can
// prove (de-duplication, order, cascade) lives in saved.int-spec.ts.
// Case IDs (S1, S2, …) refer to cases.md in the repo root.
import { Quack } from '@/modules/quack/domain/quack';
import { QuackRepository } from '@/modules/quack/repositories/quack.repository';
import { SavedQuackRepository } from '@/modules/saved/repositories/saved-quack.repository';
import { Identity } from '@/shared/auth/domain/identity';
import { NotFoundException } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { SavedQuacksService } from './saved-quacks.service';

const aQuack = (overrides: Partial<Quack> = {}): Quack => ({
  id: 'q1',
  text: 'quack quack',
  mood: null,
  userId: 'u2',
  createdAt: new Date('2026-01-01T12:00:00Z'),
  updatedAt: new Date('2026-01-01T12:00:00Z'),
  user: { id: 'u2', name: 'Bread Critic', username: 'BreadCritic' },
  ...overrides,
});

const me = { id: 'u1' } as Identity;
const someoneElse = { id: 'u2' } as Identity;

const setup = (): {
  service: SavedQuacksService;
  savedQuackRepository: ReturnType<typeof mock<SavedQuackRepository>>;
  quackRepository: ReturnType<typeof mock<QuackRepository>>;
} => {
  const savedQuackRepository = mock<SavedQuackRepository>();
  const quackRepository = mock<QuackRepository>();
  quackRepository.getQuackById.mockResolvedValue(aQuack());
  savedQuackRepository.saveQuack.mockResolvedValue();
  savedQuackRepository.unsaveQuack.mockResolvedValue();
  savedQuackRepository.getSavedQuacks.mockResolvedValue([]);
  return {
    service: new SavedQuacksService(savedQuackRepository, quackRepository),
    savedQuackRepository,
    quackRepository,
  };
};

describe('SavedQuacksService', () => {
  describe('saveQuack', () => {
    it('S1: saves the quack for the signed-in user', async () => {
      const { service, savedQuackRepository } = setup();

      await expect(service.saveQuack(me, 'q1')).resolves.toBeUndefined();
      // who saves comes from the session, never from the request
      expect(savedQuackRepository.saveQuack).toHaveBeenCalledWith({
        userId: 'u1',
        quackId: 'q1',
      });
    });

    it('S2: saving a quack that is already saved is not an error', async () => {
      const { service } = setup();

      await expect(service.saveQuack(me, 'q1')).resolves.toBeUndefined();
      await expect(service.saveQuack(me, 'q1')).resolves.toBeUndefined();
    });

    it('S7: refuses to save a quack that does not exist', async () => {
      const { service, savedQuackRepository, quackRepository } = setup();
      quackRepository.getQuackById.mockResolvedValue(null);

      await expect(service.saveQuack(me, 'nope')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(savedQuackRepository.saveQuack).not.toHaveBeenCalled();
    });

    it('S10: lets you save your own quack', async () => {
      const { service, savedQuackRepository, quackRepository } = setup();
      quackRepository.getQuackById.mockResolvedValue(aQuack({ userId: me.id }));

      await expect(service.saveQuack(me, 'q1')).resolves.toBeUndefined();
      expect(savedQuackRepository.saveQuack).toHaveBeenCalledWith({
        userId: 'u1',
        quackId: 'q1',
      });
    });
  });

  describe('unsaveQuack', () => {
    it('S5: removes the quack from the signed-in user’s Saved', async () => {
      const { service, savedQuackRepository } = setup();

      await expect(service.unsaveQuack(me, 'q1')).resolves.toBeUndefined();
      expect(savedQuackRepository.unsaveQuack).toHaveBeenCalledWith({
        userId: 'u1',
        quackId: 'q1',
      });
    });

    it('S5: removing a quack that is not saved is not an error', async () => {
      const { service, quackRepository } = setup();
      quackRepository.getQuackById.mockResolvedValue(null);

      await expect(service.unsaveQuack(me, 'q1')).resolves.toBeUndefined();
    });
  });

  describe('getSavedQuacks', () => {
    it('S1: returns the signed-in user’s saved quacks', async () => {
      const { service, savedQuackRepository } = setup();
      const saved = [aQuack({ id: 'q2' }), aQuack({ id: 'q1' })];
      savedQuackRepository.getSavedQuacks.mockResolvedValue(saved);

      await expect(service.getSavedQuacks(me)).resolves.toEqual(saved);
    });

    it('S3: reads only the Saved of the user in the session', async () => {
      const { service, savedQuackRepository } = setup();

      await service.getSavedQuacks(me);
      await service.getSavedQuacks(someoneElse);

      expect(savedQuackRepository.getSavedQuacks).toHaveBeenNthCalledWith(1, {
        userId: 'u1',
      });
      expect(savedQuackRepository.getSavedQuacks).toHaveBeenNthCalledWith(2, {
        userId: 'u2',
      });
    });
  });
});
