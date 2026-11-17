import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerToggleButton } from '@react-navigation/drawer';
import LimiteDeErro from '../components/LimiteDeErro';
import { useUsuario } from '../contexts/UsuarioContext';
import Cadastro from '../screens/Cadastro';
import Cardapio from '../screens/Cardapio';
import Carrinho from '../screens/Carrinho';
import Pedidos from '../screens/Pedidos';
import Painel from '../screens/Painel';
import { cores, fontes } from '../theme';
import MenuLateral from './MenuLateral';
import { ROTAS } from './rotas';

const Drawer = createDrawerNavigator();

function BotaoDoMenu({ tintColor }) {
  return <DrawerToggleButton tintColor={tintColor} accessibilityLabel="Abrir menu" />;
}

function SemBotao() {
  return null;
}

const opcoesDasTelas = {
  // 'front' é o tipo que abre pelo ícone do cabeçalho também na web.
  drawerType: 'front',
  overlayAccessibilityLabel: 'Fechar menu',
  headerStyle: { backgroundColor: cores.fundo },
  headerTintColor: cores.texto,
  headerTitleStyle: { ...fontes.subtitulo },
  headerShadowVisible: false,
  headerLeft: BotaoDoMenu,
  sceneStyle: { backgroundColor: cores.fundo },
};

// Sem cadastro não existe menu para abrir: nem pelo gesto, nem pelo ícone.
const opcoesDoCadastro = {
  title: 'Criar conta',
  swipeEnabled: false,
  headerLeft: SemBotao,
};

export default function Rotas() {
  const { usuario } = useUsuario();

  // As telas mudam conforme existe usuário. Ao cadastrar ou sair, o próprio
  // navegador troca de tela, sem precisar chamar navigate.
  return (
    <LimiteDeErro>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={opcoesDasTelas}
          drawerContent={(props) => <MenuLateral {...props} />}
        >
          {usuario ? (
            <>
              <Drawer.Screen
                name={ROTAS.CARDAPIO}
                component={Cardapio}
                options={{ title: 'Cardápio' }}
              />
              <Drawer.Screen
                name={ROTAS.CARRINHO}
                component={Carrinho}
                options={{ title: 'Carrinho' }}
              />
              <Drawer.Screen
                name={ROTAS.PEDIDOS}
                component={Pedidos}
                options={{ title: 'Meus pedidos' }}
              />
              <Drawer.Screen name={ROTAS.PAINEL} component={Painel} options={{ title: 'Painel' }} />
            </>
          ) : (
            <Drawer.Screen name={ROTAS.CADASTRO} component={Cadastro} options={opcoesDoCadastro} />
          )}
        </Drawer.Navigator>
      </NavigationContainer>
    </LimiteDeErro>
  );
}
