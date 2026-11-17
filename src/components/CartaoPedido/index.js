import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../Cartao';
import Etiqueta from '../Etiqueta';
import { cores } from '../../theme';
import { formatarData, formatarMoeda } from '../../utils/formatar';
import { rotuloStatus, tomStatus } from '../../utils/statusPedido';
import styles from './styles';

// Pedido guardado só no aparelho tem id "local-1"; para quem lê, o número é 1.
function numeroDoPedido(id) {
  return String(id).replace(/^local-/, '');
}

export default function CartaoPedido({ pedido, status, aberto = false, aoAlternar }) {
  const itens = pedido.itens || [];
  const resumo = itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ');
  const observacao = pedido.observacao ? String(pedido.observacao).trim() : '';
  const data = formatarData(pedido.criadoEm);
  const numero = `Pedido nº ${numeroDoPedido(pedido.id)}`;
  const legenda = data ? `${numero}, feito em ${data}` : numero;
  const apagado = status === 'retirado' ? styles.apagado : null;

  return (
    <Pressable
      testID={`cartao-pedido-${pedido.id}`}
      onPress={() => aoAlternar(pedido.id)}
      accessibilityRole="button"
      accessibilityState={{ expanded: aberto }}
      accessibilityHint={aberto ? 'Esconde os itens do pedido' : 'Mostra os itens do pedido'}
      style={({ pressed }) => (pressed ? styles.pressionado : null)}
    >
      <Cartao style={status === 'pronto' ? styles.pronto : null}>
        <View style={styles.topo}>
          <View style={styles.identificacao}>
            {pedido.retirada ? (
              <Text style={[styles.retirada, apagado]}>Retirada às {pedido.retirada}</Text>
            ) : null}
            <Text style={styles.legenda}>{legenda}</Text>
          </View>
          <Etiqueta texto={rotuloStatus(status)} tom={tomStatus(status)} />
        </View>

        {aberto ? (
          <View style={styles.detalhe}>
            {itens.map((item) => (
              <View key={String(item.produtoId)} style={styles.item}>
                <Text style={[styles.itemNome, apagado]}>
                  {item.quantidade}x {item.nome}
                </Text>
                <Text style={[styles.itemSubtotal, apagado]}>
                  {formatarMoeda(item.preco * item.quantidade)}
                </Text>
              </View>
            ))}
            {observacao ? (
              <View style={styles.observacao}>
                <Text style={styles.observacaoTitulo}>Observação</Text>
                <Text style={[styles.observacaoTexto, apagado]}>{observacao}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.linhaDoTotal}>
          {aberto ? (
            <Text style={styles.totalRotulo}>Total</Text>
          ) : (
            <Text style={styles.resumo} numberOfLines={1}>
              {resumo}
            </Text>
          )}
          <Text style={[styles.totalValor, apagado]}>{formatarMoeda(pedido.total)}</Text>
          <MaterialCommunityIcons
            name={aberto ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={cores.textoSuave}
          />
        </View>
      </Cartao>
    </Pressable>
  );
}
