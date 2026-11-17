import axios from 'axios';

// Cole aqui o endereço do projeto no mockapi.io, terminando em /api/.
// Enquanto ficar vazio, o app usa os dados locais de src/data.
export const URL_BASE = '';

export const apiDisponivel = Boolean(URL_BASE);

const api = axios.create({ baseURL: URL_BASE, timeout: 8000 });

export default api;
