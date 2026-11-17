import { ROTAS } from '../../src/navigation/rotas';

describe('ROTAS', () => {
  it('guarda os nomes das cinco rotas do Drawer', () => {
    expect(ROTAS).toEqual({
      CADASTRO: 'Cadastro',
      CARDAPIO: 'Cardapio',
      CARRINHO: 'Carrinho',
      PEDIDOS: 'Pedidos',
      PAINEL: 'Painel',
    });
  });
});
