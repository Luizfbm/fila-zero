import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../Cartao';
import Etiqueta from '../Etiqueta';
import { cores } from '../../theme';
import { formatarData, formatarMoeda } from '../../utils/formatar';
import { rotuloStatus, tomStatus } from '../../utils/statusPedido';
import styles from './styles';

export default function CartaoPedido({ pedido, status, aberto = false, aoAlternar }) {
  const itens = pedido.itens || [];
  const resumo = itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ');
  const observacao = pedido.observacao ? String(pedido.observacao).trim() : '';

  return (
    <Pressable
      onPress={() => aoAlternar(pedido.id)}
      accessibilityRole="button"
      accessibilityState={{ expanded: aberto }}
      accessibilityHint={aberto ? 'Fecha os itens do pedido' : 'Mostra os itens do pedido'}
      style={({ pressed }) => (pressed ? styles.pressionado : null)}
    >
      <Cartao>
        <View style={styles.topo}>
          <View style={styles.identificacao}>
            <Text style={styles.numero}>Pedido nº {pedido.id}</Text>
            <Text style={styles.data}>{formatarData(pedido.criadoEm)}</Text>
          </View>
          <Etiqueta texto={rotuloStatus(status)} tom={tomStatus(status)} />
        </View>

        {pedido.retirada ? (
          <Text style={styles.retirada}>Retirada às {pedido.retirada}</Text>
        ) : null}

        {!aberto && resumo ? (
          <Text style={styles.resumo} numberOfLines={1}>
            {resumo}
          </Text>
        ) : null}

        {aberto ? (
          <View style={styles.detalhe}>
            {itens.map((item) => (
              <View key={String(item.produtoId)} style={styles.item}>
                <Text style={styles.itemNome}>
                  {item.quantidade}x {item.nome}
                </Text>
                <Text style={styles.itemSubtotal}>
                  {formatarMoeda(item.preco * item.quantidade)}
                </Text>
              </View>
            ))}
            {observacao ? (
              <View style={styles.observacao}>
                <Text style={styles.observacaoTitulo}>Observação</Text>
                <Text style={styles.observacaoTexto}>{observacao}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.rodape}>
          <View style={styles.total}>
            <Text style={styles.totalRotulo}>Total</Text>
            <Text style={styles.totalValor}>{formatarMoeda(pedido.total)}</Text>
          </View>
          <MaterialCommunityIcons
            name={aberto ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={cores.textoSuave}
          />
        </View>
      </Cartao>
    </Pressable>
  );
}
