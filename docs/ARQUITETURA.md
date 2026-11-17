# Arquitetura do Fila Zero

O Fila Zero é um app para pedir lanche na cantina da faculdade pelo celular e só passar no balcão para retirar. Este documento descreve como o código está organizado e o que cada módulo expõe. Quem for mexer em uma parte do app precisa seguir os nomes daqui, porque as outras partes dependem deles.

## Regras do trabalho

O enunciado avisa que código fora do conteúdo estudado não é avaliado. Por isso:

- JavaScript puro, sem TypeScript.
- Componentes de função com hooks (`useState`, `useEffect`, `useContext`).
- Navegação com `@react-navigation/drawer` e menu customizado. Não usamos Expo Router.
- Estilo com `StyleSheet`, sempre em um `styles.js` ao lado do `index.js`.
- Requisições com `axios`, do mesmo jeito dos exemplos da disciplina (`api.js`).
- Formulário com `formik` e `TextInput`.
- Filtro com `Picker` (`@react-native-picker/picker`) alimentando uma `FlatList`.
- Ícones de `@expo/vector-icons` (`MaterialCommunityIcons`).
- Nenhuma dependência nova sem combinar antes. O projeto precisa abrir no Snack da Expo com o SDK 54.

Props são sempre desestruturadas na assinatura do componente. Pai passa dados para o filho por props (comunicação direta) e o filho avisa o pai por função recebida em prop (comunicação indireta). Estado compartilhado entre telas fica nos contextos.

## Pastas

```
App.js                     provedores de contexto e as rotas
src/theme/index.js         cores, espaços, raios, fontes, sombra
src/services/              axios e acesso aos dados
src/data/                  dados locais (JSON) usados quando não há API
src/contexts/              UsuarioContext, CarrinhoContext, PedidosContext
src/utils/                 formatação e validação
src/components/<Nome>/     index.js + styles.js
src/navigation/            Drawer e menu lateral
src/screens/<Nome>/        index.js + styles.js
__tests__/                 testes, espelhando a estrutura de src
```

## Tema

`src/theme/index.js` exporta `cores`, `espacos`, `raios`, `fontes` e `sombra`. Nenhum componente escreve cor ou espaçamento na mão.

## Dados

Produto: `{ id, nome, descricao, preco, categoria, disponivel }`, com `preco` em reais (número) e `categoria` igual ao `id` de uma categoria.

Categoria: `{ id, nome, icone }`, com `icone` sendo um nome de ícone do `MaterialCommunityIcons`.

Pedido: `{ id, usuarioId, itens, total, retirada, observacao, status, criadoEm }`. Cada item é `{ produtoId, nome, preco, quantidade, categoria }`. `retirada` é um horário como `"09:50"`. `status` é um de `recebido`, `em preparo`, `pronto`, `retirado`. `criadoEm` é uma data ISO.

Usuário: `{ id, nome, email, matricula, curso, cep, logradouro, bairro, cidade, uf }`. A senha não é guardada nem enviada.

## Serviços

Toda função de serviço devolve `{ dados, origem }`, em que `origem` é `'api'` ou `'local'`. Se `URL_BASE` em `src/services/api.js` estiver vazia, ou se a chamada falhar, o serviço cai para os dados locais e guarda o que for criado em memória. A tela nunca recebe exceção por causa de rede nesses serviços.

- `produtos.js`: `listarProdutos()`, `listarCategorias()`
- `pedidos.js`: `listarPedidos(usuarioId)`, `criarPedido(pedido)`
- `usuarios.js`: `cadastrarUsuario(dados)`
- `cep.js`: `buscarCep(cep)` consulta o ViaCEP e devolve `{ logradouro, bairro, cidade, uf }`. Essa é a exceção: ela lança `Error` com mensagem pronta para mostrar ao usuário quando o CEP não existe ou a rede falha.

Rotas esperadas no mockapi: `GET /produtos`, `GET /categorias`, `GET /pedidos?usuarioId=`, `POST /pedidos`, `POST /usuarios`.

## Utilitários

`src/utils/formatar.js`:

- `formatarMoeda(12.5)` devolve `"R$ 12,50"`
- `formatarData(iso)` devolve `"17/11/2026 08:30"`
- `somenteDigitos("29.100-000")` devolve `"29100000"`
- `mascararCep("29100000")` devolve `"29100-000"`

`src/utils/validacoes.js`:

- `validarCadastro(valores)` devolve um objeto com uma mensagem por campo inválido, no formato que o `formik` espera. Objeto vazio quer dizer formulário válido.

Campos do cadastro: `nome`, `email`, `matricula`, `curso`, `cep`, `logradouro`, `bairro`, `cidade`, `uf`, `senha`, `confirmarSenha`.

## Contextos

`UsuarioContext.js` exporta `UsuarioProvider` e `useUsuario()`, que devolve `{ usuario, entrar(usuario), sair() }`. `usuario` é `null` antes do cadastro.

`CarrinhoContext.js` exporta `CarrinhoProvider` e `useCarrinho()`, que devolve `{ itens, total, quantidade, adicionar(produto), remover(produtoId), alterarQuantidade(produtoId, quantidade), limpar() }`. Cada item é `{ produto, quantidade }`. `quantidade` no contexto é a soma das unidades.

`PedidosContext.js` exporta `PedidosProvider` e `usePedidos()`, que devolve `{ pedidos, carregando, erro, origem, carregar(usuarioId), registrar(pedido) }`. `registrar` chama o serviço, coloca o pedido novo no começo da lista e devolve o pedido criado.

## Rotas

Nomes das rotas do Drawer: `Cadastro`, `Cardapio`, `Carrinho`, `Pedidos`, `Painel`. Sem usuário cadastrado, o app mostra só o Cadastro.

## Testes

Os testes ficam em `__tests__/`, com Jest e `@testing-library/react-native`. O fluxo é escrever o teste, ver falhar, implementar e só então refatorar. `npm test` precisa passar antes de abrir o pull request.
