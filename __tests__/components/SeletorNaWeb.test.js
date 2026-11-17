/** @jest-environment node */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Seletor from '../../src/components/Seletor';

// Monto o HTML que o react-native-web gera, para olhar o <select> que o navegador recebe.
jest.mock('react-native', () => require('react-native-web'));
jest.mock('@react-native-picker/picker', () => ({
  Picker: require('@react-native-picker/picker/js/Picker.web.js').default,
}));

const opcoes = [
  { rotulo: 'Selecione', valor: '' },
  { rotulo: 'Sistemas de Informação', valor: 'si' },
];

describe('Seletor na web', () => {
  it('o select leva o rótulo como nome, não a opção escolhida', () => {
    const html = renderToStaticMarkup(
      <Seletor rotulo="Curso" valor="" aoMudar={jest.fn()} opcoes={opcoes} />
    );

    expect(html).toContain('<select aria-label="Curso"');
  });
});
