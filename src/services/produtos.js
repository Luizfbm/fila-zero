import api, { apiDisponivel } from './api';
import produtosLocais from '../data/produtos.json';
import categoriasLocais from '../data/categorias.json';

async function listar(rota, locais) {
  if (apiDisponivel) {
    try {
      const resposta = await api.get(rota);
      if (Array.isArray(resposta.data)) {
        return { dados: resposta.data, origem: 'api' };
      }
    } catch (erro) {
      // Sem API, segue com o que está em src/data.
    }
  }

  return { dados: [...locais], origem: 'local' };
}

export async function listarProdutos() {
  return listar('produtos', produtosLocais);
}

export async function listarCategorias() {
  return listar('categorias', categoriasLocais);
}
