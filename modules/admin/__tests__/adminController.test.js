import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminController from '../adminController.js';
import { adminService } from '../adminService.js';

vi.mock('../adminService.js', () => ({
  adminService: {
    getDashboardData: vi.fn(),
    getAnalyticsData: vi.fn()
  }
}));

describe('AdminController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { query: {}, flash: vi.fn() };
    res = { render: vi.fn(), redirect: vi.fn() };
  });

  describe('dashboard', () => {
    it('deve renderizar o dashboard com os dados', async () => {
      adminService.getDashboardData.mockResolvedValue({ totalUsers: 5 });
      await adminController.dashboard(req, res);
      
      expect(adminService.getDashboardData).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('pages/admin/dashboard', expect.objectContaining({
        totalUsers: 5,
        activePage: 'dashboard'
      }));
    });

    it('deve lidar com erro no dashboard', async () => {
      adminService.getDashboardData.mockRejectedValue(new Error('Erro'));
      await adminController.dashboard(req, res);
      
      expect(req.flash).toHaveBeenCalledWith('error', 'Erro ao carregar dashboard.');
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('analytics', () => {
    it('deve renderizar analytics com os dados', async () => {
      adminService.getAnalyticsData.mockResolvedValue({ totalUsers: 10 });
      await adminController.analytics(req, res);
      
      expect(adminService.getAnalyticsData).toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith('pages/admin/analytics', expect.objectContaining({
        totalUsers: 10,
        activePage: 'analytics'
      }));
    });

    it('deve lidar com erro no analytics', async () => {
      adminService.getAnalyticsData.mockRejectedValue(new Error('Erro'));
      await adminController.analytics(req, res);
      
      expect(req.flash).toHaveBeenCalledWith('error', 'Erro ao carregar analytics.');
      expect(res.redirect).toHaveBeenCalledWith('/admin');
    });
  });
});
