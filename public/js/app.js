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
