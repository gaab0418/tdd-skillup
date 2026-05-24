import { describe, it, expect, vi, beforeEach } from 'vitest';
import contentController from '../contentController.js';
import { contentService, ContentServiceError } from '../contentService.js';

vi.mock('../contentService.js', () => ({
  contentService: {
    getContentIndex: vi.fn(),
    getContentCreateData: vi.fn(),
    createContent: vi.fn(),
    getContentEditData: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn()
  },
  ContentServiceError: class extends Error {
    constructor(msg) { super(msg); this.name = 'ContentServiceError'; }
  }
}));

describe('ContentController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { query: {}, params: {}, body: {}, files: {}, session: { userId: 1 }, flash: vi.fn() };
    res = { render: vi.fn(), redirect: vi.fn() };
  });

  describe('index', () => {
    it('deve renderizar a listagem', async () => {
      contentService.getContentIndex.mockResolvedValue({ lessons: [] });
      await contentController.index(req, res);
      expect(res.render).toHaveBeenCalledWith('pages/admin/content', expect.any(Object));
    });

    it('deve lidar com erro na listagem', async () => {
      contentService.getContentIndex.mockRejectedValue(new Error('Erro'));
      await contentController.index(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/admin');
    });
  });

  describe('create', () => {
    it('deve renderizar o form de criacao', async () => {
      contentService.getContentCreateData.mockResolvedValue({ topics: [] });
      await contentController.create(req, res);
      expect(res.render).toHaveBeenCalledWith('pages/lessons/create', expect.any(Object));
    });

    it('deve lidar com erro na criacao', async () => {
      contentService.getContentCreateData.mockRejectedValue(new Error('Erro'));
      await contentController.create(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/admin/conteudo');
    });
  });

  describe('store', () => {
    it('deve criar licao e redirecionar', async () => {
      contentService.createContent.mockResolvedValue();
      await contentController.store(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/admin/conteudo');
    });

    it('deve lidar com erro ao criar', async () => {
      contentService.createContent.mockRejectedValue(new Error('Erro'));
      await contentController.store(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/admin/conteudo/create');
    });
  });

  describe('edit', () => {
    it('deve renderizar form de edicao', async () => {
      req.params.id = 1;
      contentService.getContentEditData.mockResolvedValue({ lesson: {} });
      await contentController.edit(req, res);
      expect(res.render).toHaveBeenCalledWith('pages/lessons/create', expect.any(Object));
    });

    it('deve lidar com erro de ContentServiceError na edicao', async () => {
      req.params.id = 1;
      const { ContentServiceError } = await import('../contentService.js');
      contentService.getContentEditData.mockRejectedValue(new ContentServiceError('Nao existe'));
      await contentController.edit(req, res);
      expect(req.flash).toHaveBeenCalledWith('error', 'Nao existe');
      expect(res.redirect).toHaveBeenCalledWith('/admin/conteudo');
    });

    it('deve lidar com erro generico na edicao', async () => {
      req.params.id = 1;
      contentService.getContentEditData.mockRejectedValue(new Error('Generico'));
      await contentController.edit(req, res);
      expect(req.flash).toHaveBeenCalledWith('error', 'Erro ao carregar licao.');
    });
  });

  describe('update', () => {
    it('deve atualizar e redirecionar', async () => {
      req.params.id = 1;
      contentService.updateContent.mockResolvedValue();
      await contentController.update(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/admin/conteudo');
    });

    it('deve lidar com ContentServiceError na atualizacao', async () => {
      req.params.id = 1;
      const { ContentServiceError } = await import('../contentService.js');
      contentService.updateContent.mockRejectedValue(new ContentServiceError('Nao existe'));
      await contentController.update(req, res);
      expect(req.flash).toHaveBeenCalledWith('error', 'Nao existe');
      expect(res.redirect).toHaveBeenCalledWith('/admin/conteudo/1/edit');
    });

    it('deve lidar com erro generico na atualizacao', async () => {
      req.params.id = 1;
      contentService.updateContent.mockRejectedValue(new Error('Generico'));
      await contentController.update(req, res);
      expect(req.flash).toHaveBeenCalledWith('error', 'Erro ao atualizar licao.');
    });
  });

  describe('destroy', () => {
    it('deve deletar e redirecionar', async () => {
      req.params.id = 1;
      contentService.deleteContent.mockResolvedValue();
      await contentController.destroy(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/admin/conteudo');
    });

    it('deve lidar com erro no delete', async () => {
      req.params.id = 1;
      const { ContentServiceError } = await import('../contentService.js');
      contentService.deleteContent.mockRejectedValue(new ContentServiceError('Nao existe'));
      await contentController.destroy(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/admin/conteudo');
    });
    
    it('deve lidar com erro generico no delete', async () => {
      req.params.id = 1;
      contentService.deleteContent.mockRejectedValue(new Error('Generico'));
      await contentController.destroy(req, res);
      expect(req.flash).toHaveBeenCalledWith('error', 'Erro ao excluir licao.');
    });
  });
});
