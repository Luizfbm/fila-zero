import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUsuario } from '../../contexts/UsuarioContext';
import { useCarrinho } from '../../contexts/CarrinhoContext';
import { cores } from '../../theme';
import { ROTAS } from '../rotas';
import styles from './styles';

const ICONES = {
  [ROTAS.CADASTRO]: 'account-plus-outline',
  [ROTAS.CARDAPIO]: 'silverware-fork-knife',
  [ROTAS.CARRINHO]: 'cart-outline',
  [ROTAS.PEDIDOS]: 'clipboard-text-outline',
  [ROTAS.PAINEL]: 'chart-bar',
};

// Primeira letra do primeiro nome e do último. Nome de uma palavra só rende uma letra.
function pegarIniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return '';
  }
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

function ItemDoMenu({ titulo, icone, ativo, contador, aoTocar }) {
  const temContador = contador > 0;
  const rotulo = temContador
    ? `${titulo}, ${contador} ${contador === 1 ? 'item' : 'itens'}`
    : titulo;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={rotulo}
      onPress={aoTocar}
      style={[styles.item, ativo && styles.itemAtivo]}
    >
      <MaterialCommunityIcons
        name={icone}
        size={22}
        color={ativo ? cores.primariaEscura : cores.textoSuave}
      />
      <Text style={[styles.textoDoItem, ativo && styles.textoDoItemAtivo]}>{titulo}</Text>
      {temContador ? (
        <View style={styles.contador}>
          <Text testID="contador-do-carrinho" style={styles.textoDoContador}>
            {contador}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function MenuLateral({ state, navigation, descriptors }) {
  const { usuario, sair } = useUsuario();
  const { quantidade } = useCarrinho();
  const margens = useSafeAreaInsets();

  // Sem cadastro o menu nem abre, então não tem o que desenhar.
  if (!usuario) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.cabecalho, { paddingTop: margens.top + styles.cabecalho.paddingTop }]}>
        <View style={styles.avatar}>
          <Text style={styles.iniciais}>{pegarIniciais(usuario.nome)}</Text>
        </View>
        <Text style={styles.nome} numberOfLines={1}>
          {usuario.nome}
        </Text>
        <Text style={styles.curso} numberOfLines={1}>
          {usuario.curso}
        </Text>
      </View>

      <DrawerContentScrollView contentContainerStyle={styles.lista}>
        {state.routes.map((rota, indice) => {
          const ativo = indice === state.index;
          const { title } = descriptors[rota.key].options;

          return (
            <ItemDoMenu
              key={rota.key}
              titulo={title || rota.name}
              icone={ICONES[rota.name] || 'circle-outline'}
              ativo={ativo}
              contador={rota.name === ROTAS.CARRINHO ? quantidade : 0}
              aoTocar={() => (ativo ? navigation.closeDrawer() : navigation.navigate(rota.name))}
            />
          );
        })}
      </DrawerContentScrollView>

      <View style={[styles.rodape, { paddingBottom: margens.bottom + styles.rodape.paddingBottom }]}>
        <Pressable accessibilityRole="button" onPress={sair} style={styles.item}>
          <MaterialCommunityIcons name="logout" size={22} color={cores.textoSuave} />
          <Text style={styles.textoDoItem}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}
