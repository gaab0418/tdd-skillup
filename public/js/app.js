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
});
