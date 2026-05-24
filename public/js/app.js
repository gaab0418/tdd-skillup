// SkillUp - Frontend JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Auto-dismiss flash messages
  setTimeout(() => {
    document.querySelectorAll('.flash-message').forEach(el => {
      el.style.transition = 'all 0.3s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      setTimeout(() => el.remove(), 300);
    });
  }, 5000);

  // Global Toast Function
  window.showToast = function(message, type = 'error') {
    let container = document.getElementById('flash-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'flash-container';
      container.className = 'fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm';
      document.body.appendChild(container);
    }

    const ft = type === 'error' 
      ? { icon: 'error', bg: 'bg-red-50 border-red-400 text-red-800' }
      : { icon: 'check_circle', bg: 'bg-green-50 border-green-400 text-green-800' };

    const toast = document.createElement('div');
    toast.className = `flash-message flex items-center gap-3 px-4 py-3 rounded-lg border ${ft.bg} shadow-lg animate-slide-in transition-all duration-300`;
    
    toast.innerHTML = `
      <span class="material-symbols-outlined text-lg">${ft.icon}</span>
      <span class="flex-1 text-sm font-medium">${message}</span>
      <button onclick="this.parentElement.remove()" class="hover:opacity-70">
        <span class="material-symbols-outlined text-sm">close</span>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  };

  // Like button handler
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const commentId = btn.dataset.commentId;
      const lessonId = btn.dataset.lessonId;
      if (!commentId || !lessonId) return;

      try {
        const res = await fetch(`/lessons/${lessonId}/comments/${commentId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        
        if (data.success) {
          const icon = btn.querySelector('.material-symbols-outlined');
          const countEl = btn.querySelector('.like-count');
          
          if (data.liked) {
            btn.classList.remove('text-outline');
            btn.classList.add('text-primary');
            icon.classList.add('icon-filled');
          } else {
            btn.classList.remove('text-primary');
            btn.classList.add('text-outline');
            icon.classList.remove('icon-filled');
          }
          if (countEl) countEl.textContent = data.likeCount;
        }
      } catch (err) {
        console.error('Erro ao curtir:', err);
      }
    });
  });

  // Mobile Topnav Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Mobile Sidenav Toggle (Admin)
  const sidenavBtn = document.getElementById('mobile-sidenav-btn');
  const sidenav = document.getElementById('admin-sidenav');
  const sidenavBackdrop = document.getElementById('sidenav-backdrop');

  function toggleSidenav() {
    if (sidenav) {
      sidenav.classList.toggle('-translate-x-full');
      if (sidenavBackdrop) {
        sidenavBackdrop.classList.toggle('hidden');
      }
    }
  }

  if (sidenavBtn) sidenavBtn.addEventListener('click', toggleSidenav);
  if (sidenavBackdrop) sidenavBackdrop.addEventListener('click', toggleSidenav);
});
