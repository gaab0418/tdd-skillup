import { describe, it, expect } from 'vitest';
import UserXP from '../UserXP.js';

describe('UserXP Model', () => {
  it('deve instanciar um UserXP corretamente', () => {
    const xp = UserXP.build({
      action: 'watch_video',
      points: 15
    });

    expect(xp.action).toBe('watch_video');
    expect(xp.points).toBe(15);
  });

  it('deve usar o valor padrão de points', () => {
    const xp = UserXP.build({
      action: 'post_comment'
    });

    expect(xp.points).toBe(10);
  });

  it('deve lançar erro de validação se points for menor que 1', async () => {
    const xp = UserXP.build({
      action: 'post_comment',
      points: 0
    });

    await expect(xp.validate()).rejects.toThrow('Pontos devem ser no mínimo 1');
  });


});
