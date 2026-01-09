// Système de notifications toast
export const showNotification = (message, type = 'info', duration = 5000) => {
  // Créer l'élément de notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Icône selon le type
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  notification.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <span>${message}</span>
    <button class="notification-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Style CSS
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${getBackgroundColor(type)};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 9999;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
  `;
  
  // Animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .notification-close {
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 14px;
      opacity: 0.7;
      transition: opacity 0.3s;
    }
    
    .notification-close:hover {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
  
  // Ajouter au DOM
  document.body.appendChild(notification);
  
  // Fermer la notification
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.onclick = () => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  };
  
  // Auto-fermer après la durée
  setTimeout(() => {
    if (notification.parentNode) {
      closeBtn.click();
    }
  }, duration);
  
  return notification;
};

// Couleurs de fond selon le type
const getBackgroundColor = (type) => {
  const colors = {
    success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
    info: 'linear-gradient(135deg, #3498db, #2980b9)'
  };
  return colors[type] || colors.info;
};

// Notification pour les mises à jour en temps réel
export const showRealtimeNotification = (title, message, type = 'info') => {
  return showNotification(`[Live] ${title}: ${message}`, type);
};
