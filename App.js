import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { UsuarioProvider } from './src/contexts/UsuarioContext';
import { CarrinhoProvider } from './src/contexts/CarrinhoContext';
import { PedidosProvider } from './src/contexts/PedidosContext';
import Rotas from './src/navigation';

export default function App() {
  return (
    <UsuarioProvider>
      <CarrinhoProvider>
        <PedidosProvider>
          <StatusBar style="dark" />
          <Rotas />
        </PedidosProvider>
      </CarrinhoProvider>
    </UsuarioProvider>
  );
}
