# Arquitetura do Fila Zero

O Fila Zero é um app para pedir lanche na cantina da faculdade pelo celular e só passar no balcão para retirar. Este documento descreve como o código está organizado e o que cada módulo expõe. Quem for mexer em uma parte do app precisa seguir os nomes daqui, porque as outras partes dependem deles.

## Regras do trabalho

O enunciado avisa que código fora do conteúdo estudado não é avaliado. Por isso:

- JavaScript puro, sem TypeScript.
- Componentes de função. Os únicos hooks do React no projeto são `useState`, `useEffect` e `useContext`. Não entram `useMemo`, `useCallback`, `useRef`, `useReducer` nem `React.memo`. Hooks das bibliotecas, como `useFormik` e `useSafeAreaInsets`, podem ser usados.
- `LimiteDeErro` é o único componente de classe, porque o React só captura erro de renderização em classe.
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
src/data/                  produtos, categorias, cursos e horários de retirada (JSON)
src/contexts/              UsuarioContext, CarrinhoContext, PedidosContext
src/utils/                 formatação, validação, status do pedido e contas do painel
src/components/<Nome>/     index.js + styles.js
src/navigation/index.js    Drawer com as telas
src/navigation/rotas.js    nomes das rotas
src/navigation/MenuLateral/ menu customizado do Drawer
src/screens/<Nome>/        index.js + styles.js
__tests__/                 testes, espelhando a estrutura de src
```

## Tema

`src/theme/index.js` exporta `cores`, `espacos`, `raios`, `fontes` e `sombra`. Nenhum componente escreve cor ou espaçamento na mão.

## Dados

Produto: `{ id, nome, descricao, preco, categoria, disponivel }`, com `preco` em reais (número) e `categoria` igual ao `id` de uma categoria.

Categoria: `{ id, nome, icone }`, com `icone` sendo um nome de ícone do `MaterialCommunityIcons`.

Pedido: `{ id, usuarioId, itens, total, retirada, observacao, status, criadoEm }`. Cada item é `{ produtoId, nome, preco, quantidade, categoria }`. `retirada` é um horário como `"09:50"`. `status` é um de `recebido`, `em preparo`, `pronto`, `retirado`. `criadoEm` é uma data ISO.

Usuário: `{ id, nome, email, matricula, curso, cep, logradouro, bairro, cidade, uf }`. A senha não é guardada nem enviada. `curso` guarda o nome do curso.

Arquivos em `src/data/`:

- `produtos.json` e `categorias.json`: o cardápio usado quando não há API.
- `cursos.json`: lista de `{ id, nome }` que alimenta o seletor de curso do Cadastro.
- `horarios.json`: lista de horários de retirada, como `"09:50"`, que alimenta o seletor do Carrinho.

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
- `numeroDoPedido("local-3")` devolve `"3"`. Pedido criado sem API recebe id com o prefixo `local-`, e esse prefixo não aparece para a pessoa. Aceita número e devolve `""` para valor ausente.

`src/utils/validacoes.js`:

- `validarCadastro(valores)` devolve um objeto com uma mensagem por campo inválido, no formato que o `formik` espera. Objeto vazio quer dizer formulário válido.

Campos do cadastro: `nome`, `email`, `matricula`, `curso`, `cep`, `logradouro`, `bairro`, `cidade`, `uf`, `senha`, `confirmarSenha`.

`src/utils/statusPedido.js`:

- `STATUS` é a lista `['recebido', 'em preparo', 'pronto', 'retirado']`, na ordem em que o pedido anda.
- `statusAtual(pedido, agora)` devolve o status que a tela mostra (veja "Simulação de status").
- `rotuloStatus(status)` devolve o texto da etiqueta, como `"Pronto para retirar"`.
- `tomStatus(status)` devolve o tom da `Etiqueta`: `neutro`, `alerta` ou `sucesso`.

`src/utils/resumo.js` faz as contas do Painel. São funções puras, e as somas são feitas em centavos:

- `filtrarPorPeriodo(pedidos, periodo, agora)` aceita `hoje`, `7dias` e `30dias`. Qualquer outro valor devolve todos os pedidos.
- `resumir(pedidos)` devolve `{ totalGasto, quantidadePedidos, ticketMedio, itemMaisPedido }`, com `itemMaisPedido` no formato `{ nome, quantidade }` ou `null`.
- `itensMaisPedidos(pedidos, limite = 5)` devolve uma lista de `{ produtoId, nome, quantidade, valor }`.
- `gastoPorCategoria(pedidos, categorias)` devolve uma lista de `{ id, nome, icone, valor, percentual }`, do maior gasto para o menor. Os percentuais são inteiros e somam 100. Item de categoria desconhecida cai em "Outros".

### Simulação de status

A API de exemplo não tem cozinha, então nada muda o status de um pedido depois que ele é criado. `statusAtual` faz o pedido `recebido` andar pelo relógio: fica `recebido` no primeiro minuto, `em preparo` até o terceiro e `pronto` depois disso. Pedido `recebido` de um dia anterior aparece como `retirado`. Se o pedido já vier com outro status gravado, vale o que está gravado.

A tela Pedidos guarda a hora atual em estado e atualiza a cada 30 segundos com `setInterval`, e é isso que faz o status mudar na tela sem nova busca. `CartaoPedido` recebe o status calculado por prop.

## Contextos

`UsuarioContext.js` exporta `UsuarioProvider` e `useUsuario()`, que devolve `{ usuario, entrar(usuario), sair() }`. `usuario` é `null` antes do cadastro.

`CarrinhoContext.js` exporta `CarrinhoProvider` e `useCarrinho()`, que devolve `{ itens, total, quantidade, adicionar(produto), remover(produtoId), alterarQuantidade(produtoId, quantidade), limpar() }`. Cada item é `{ produto, quantidade }`. `quantidade` no contexto é a soma das unidades.

`PedidosContext.js` exporta `PedidosProvider` e `usePedidos()`, que devolve `{ pedidos, carregando, erro, origem, carregar(usuarioId), registrar(pedido) }`. `registrar` chama o serviço, coloca o pedido novo no começo da lista e devolve o pedido criado.

Os provedores ficam em `App.js` nesta ordem: `UsuarioProvider`, `CarrinhoProvider`, `PedidosProvider`. Quando a pessoa sai da conta, o carrinho e a lista de pedidos são esvaziados.

## Componentes

Cada componente fica em `src/components/<Nome>/`, com `index.js` e `styles.js`.

Base:

- `Botao`: `{ titulo, onPress, variante, carregando, desabilitado, icone }`. `variante` é `primario`, `secundario` ou `texto`.
- `CampoTexto`: `{ rotulo, erro, style, ...props }`. O resto vai para o `TextInput`. O rótulo também é o `accessibilityLabel` do campo.
- `CampoSenha`: mesmas props do `CampoTexto`, com o botão que mostra e esconde a senha.
- `Seletor`: `{ rotulo, valor, aoMudar, opcoes, erro, style }`. `opcoes` é uma lista de `{ rotulo, valor }`. O rótulo vai como `accessibilityLabel` do `Picker`, que na web vira o `aria-label` do `<select>`.
- `Cartao`: `{ children, style }`.
- `Etiqueta`: `{ texto, tom }`. `tom` é `neutro`, `sucesso`, `alerta` ou `erro`.
- `Aviso`: `{ tipo, mensagem, acao, style }`. `tipo` é `info`, `erro` ou `sucesso`. `acao` é `{ titulo, onPress }`.
- `EstadoVazio`: `{ icone, titulo, mensagem, acao }`, com `acao` no mesmo formato do `Aviso`.
- `Carregando`: `{ mensagem }`.
- `ControleQuantidade`: `{ valor, nome, aoDiminuir, aoAumentar }`. `nome` é opcional. Com ele, os botões são anunciados como "Diminuir quantidade de Coxinha" e "Aumentar quantidade de Coxinha".
- `LimiteDeErro`: envolve a navegação e mostra uma tela de erro com a opção de tentar de novo quando algum componente quebra ao renderizar.

Cardápio e carrinho:

- `ItemCardapio`: `{ produto, categoria, quantidade, aoAdicionar, aoAumentar, aoDiminuir }`. Com `quantidade` maior que zero, troca o botão Adicionar pelo `ControleQuantidade`. Produto indisponível mostra a etiqueta "Esgotado".
- `BarraCarrinho`: `{ quantidade, total, aoAbrir, larguraMaxima }`. É a barra no rodapé do Cardápio que leva ao Carrinho.
- `ItemCarrinho`: `{ item, aoAumentar, aoDiminuir, aoRemover }`, com `item` no formato `{ produto, quantidade }`.

Pedidos e painel:

- `CartaoPedido`: `{ pedido, status, aberto, aoAlternar }`. Fechado, mostra o resumo dos itens. Aberto, lista os itens e a observação. `aoAlternar` recebe o `id` do pedido. A legenda fica em uma linha, no formato "Pedido nº 1, 17/11/2026 08:46".
- `Indicador`: `{ rotulo, valor, icone, detalhe }`. É o cartão de número do Painel.
- `BarraCategoria`: `{ nome, icone, valor, percentual }`. É a barra de gasto por categoria do Painel.

## Rotas

`src/navigation/rotas.js` exporta `ROTAS`, com os nomes das rotas do Drawer: `ROTAS.CADASTRO` (`Cadastro`), `ROTAS.CARDAPIO` (`Cardapio`), `ROTAS.CARRINHO` (`Carrinho`), `ROTAS.PEDIDOS` (`Pedidos`) e `ROTAS.PAINEL` (`Painel`). Telas e menu usam essas constantes em vez do texto solto.

`src/navigation/index.js` monta o Drawer dentro do `LimiteDeErro`. Sem usuário cadastrado, a única tela registrada é o Cadastro, sem menu. Com usuário, entram Cardápio, Carrinho, Meus pedidos e Painel. A troca acontece sozinha quando `usuario` muda no contexto, sem chamar `navigate`.

`src/navigation/MenuLateral` é o conteúdo customizado do Drawer. Mostra quem está usando o app, os itens do menu com a quantidade de itens do carrinho e a opção de sair.

## Carga de dados nas telas

As telas não usam `useFocusEffect`, que depende de `useCallback`. Pedidos e Painel recebem `navigation` por prop e, em um `useEffect`, registram `navigation.addListener('focus', ...)` para chamar `carregar(usuario.id)` do `PedidosContext`. O Drawer emite `focus` na primeira exibição e toda vez que a pessoa volta para a tela, então um pedido feito no Carrinho aparece nas duas sem busca na montagem. O retorno do `addListener` é a função de limpeza do efeito.

O Cardápio busca produtos e categorias uma vez, na montagem. O Carrinho ouve o evento `blur` para tirar da tela a confirmação do pedido anterior quando a pessoa sai.

## Testes

Os testes ficam em `__tests__/`, com Jest e `@testing-library/react-native`. O fluxo é escrever o teste, ver falhar, implementar e só então refatorar. `npm test` precisa passar antes de abrir o pull request.
