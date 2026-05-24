import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userService, UserServiceError } from '../userService.js';
import { User } from '../../../models/index.js';

// Mock dos models do Sequelize
vi.mock('../../../models/index.js', () => {
  return {
    User: {
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      findByPk: vi.fn(),
      destroy: vi.fn(),
    },
    Course: {
      findAll: vi.fn(),
    },
    UserCourse: {
      bulkCreate: vi.fn(),
      destroy: vi.fn(),
    }
  };
});

describe('Testes de API Externa - ViaCEP (Nota 9)', () => {
  let fetchSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // BLOCO 1: buscarDadosPorCep — Busca direta por CEP numérico
  // ============================================================
  describe('buscarDadosPorCep(cep)', () => {
    it('[Nota 9] deve retornar dados completos do endereço quando o CEP é válido', async () => {
      const mockViaCep = {
        cep: '89231-630',
        logradouro: 'Rua General de Divisão de Euclides P Bueno',
        complemento: '',
        bairro: 'Paranaguamirim',
        localidade: 'Joinville',
        uf: 'SC',
        ibge: '4209102',
        gia: '',
        ddd: '47',
        siafi: '8181'
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockViaCep
      });

      const result = await userService.buscarDadosPorCep('89231-630');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith('https://viacep.com.br/ws/89231630/json/');
      expect(result).toHaveProperty('localidade', 'Joinville');
      expect(result).toHaveProperty('uf', 'SC');
      expect(result).toHaveProperty('bairro', 'Paranaguamirim');
      expect(result).toHaveProperty('logradouro');
    });

    it('[Nota 9] deve limpar caracteres não-numéricos do CEP antes de consultar', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cep: '01001-000', localidade: 'São Paulo', uf: 'SP' })
      });

      await userService.buscarDadosPorCep('01.001-000');

      // Verifica que a URL enviada ao fetch contém apenas dígitos
      expect(fetchSpy).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json/');
    });

    it('[Nota 9] deve lançar UserServiceError quando o CEP não existe (flag erro: true)', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ erro: true })
      });

      await expect(userService.buscarDadosPorCep('99999999'))
        .rejects.toThrow('CEP não encontrado.');
    });

    it('[Nota 9] deve lançar UserServiceError quando o CEP tem formato inválido (menos de 8 dígitos)', async () => {
      await expect(userService.buscarDadosPorCep('1234'))
        .rejects.toThrow('CEP inválido.');

      // fetch jamais deve ser chamado para CEPs mal formatados
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('[Nota 9] deve lançar UserServiceError quando a API responde com status HTTP não-ok (ex: 500)', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(userService.buscarDadosPorCep('01001000'))
        .rejects.toThrow('Erro na comunicação com ViaCEP.');
    });

    it('[Nota 9] deve lançar UserServiceError quando ocorre falha de rede / timeout', async () => {
      fetchSpy.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(userService.buscarDadosPorCep('01001000'))
        .rejects.toThrow(UserServiceError);
    });
  });

  // ============================================================
  // BLOCO 2: buscarCepPorEndereco — Busca reversa por texto
  // ============================================================
  describe('buscarCepPorEndereco(uf, cidade, rua)', () => {
    it('[Nota 9] deve retornar array de endereços quando a busca por texto encontra resultados', async () => {
      const mockArray = [
        { cep: '89201-010', logradouro: 'Rua Quinze de Novembro', bairro: 'Centro', localidade: 'Joinville', uf: 'SC' },
        { cep: '89201-011', logradouro: 'Rua Quinze de Novembro', bairro: 'Anita Garibaldi', localidade: 'Joinville', uf: 'SC' }
      ];

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => mockArray
      });

      const result = await userService.buscarCepPorEndereco('SC', 'Joinville', 'Quinze de Novembro');

      expect(fetchSpy).toHaveBeenCalledWith('https://viacep.com.br/ws/SC/Joinville/Quinze de Novembro/json/');
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('cep', '89201-010');
      expect(result[1]).toHaveProperty('bairro', 'Anita Garibaldi');
    });

    it('[Nota 9] deve retornar array vazio quando a busca por texto não encontra correspondência', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const result = await userService.buscarCepPorEndereco('SP', 'Cidade Inexistente', 'Rua Fantasma');
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('[Nota 9] deve lançar UserServiceError quando faltar algum parâmetro obrigatório', async () => {
      await expect(userService.buscarCepPorEndereco('', 'Joinville', 'Rua'))
        .rejects.toThrow('UF, Cidade e Rua são obrigatórios.');

      await expect(userService.buscarCepPorEndereco('SC', '', 'Rua'))
        .rejects.toThrow('UF, Cidade e Rua são obrigatórios.');

      await expect(userService.buscarCepPorEndereco('SC', 'Joinville', ''))
        .rejects.toThrow('UF, Cidade e Rua são obrigatórios.');

      // Nenhuma chamada de rede deve ter sido feita
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('[Nota 9] deve lançar UserServiceError quando ocorre falha de rede na busca por texto', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network Error'));

      await expect(userService.buscarCepPorEndereco('SC', 'Joinville', 'Sé'))
        .rejects.toThrow(UserServiceError);
    });
  });

  // ============================================================
  // BLOCO 3: salvarDadosComplementares — Persistência no banco
  // ============================================================
  describe('salvarDadosComplementares(userId, dados)', () => {
    it('[Nota 9] deve atualizar os dados complementares do usuário no banco', async () => {
      const mockUser = {
        id: 1,
        update: vi.fn().mockResolvedValue(true)
      };
      User.findByPk.mockResolvedValue(mockUser);

      const dados = {
        telefone: '(47) 99921-2614',
        genero: 'Masculino',
        cep: '89231-630',
        rua: 'Rua General de Divisão',
        bairro: 'Paranaguamirim',
        cidade: 'Joinville',
        estado: 'SC',
        complemento: 'Apto 101'
      };

      const result = await userService.salvarDadosComplementares(1, dados);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalledWith(expect.objectContaining({
        telefone: '(47) 99921-2614',
        cep: '89231-630',
        cidade: 'Joinville',
        estado: 'SC',
        complemento: 'Apto 101'
      }));
      expect(result).toBe(mockUser);
    });

    it('[Nota 9] deve lançar erro ao tentar salvar dados de um usuário inexistente', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.salvarDadosComplementares(999, { telefone: '123' }))
        .rejects.toThrow('Usuário não encontrado.');
    });
  });
});
