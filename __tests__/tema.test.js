import { cores, espacos } from '../src/theme';

describe('tema', () => {
  it('expõe a cor primária e a escala de espaços', () => {
    expect(cores.primaria).toBe('#C8452C');
    expect(espacos.md).toBe(16);
  });
});
