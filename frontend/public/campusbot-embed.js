/**
 * QuestAI Embed Script
 * Add this to any website to embed the QuestAI chatbot
 *
 * Usage:
 * <script src="https://your-domain.com/questai-embed.js" data-api="https://your-api.com"></script>
 */

(function() {
  'use strict';

  // Configuration
  const script = document.currentScript;
  const API_URL = script?.getAttribute('data-api') || 'http://localhost:8000';
  const POSITION = script?.getAttribute('data-position') || 'bottom-right';
  const PRIMARY_COLOR = script?.getAttribute('data-color') || '#10b981';

  // Session management
  const SESSION_KEY = 'questai_session';
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'qa_' + Math.random().toString(36).substr(2, 12);
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  // Inject styles
  const styles = document.createElement('style');
  styles.textContent = `
    #campusbot-container * { box-sizing: border-box; margin: 0; padding: 0; }
    #campusbot-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }

    #campusbot-btn {
      position: fixed;
      ${POSITION.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
      ${POSITION.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${PRIMARY_COLOR}, #14b8a6);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px ${PRIMARY_COLOR}66;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 99999;
    }
    #campusbot-btn:hover { transform: scale(1.05); }
    #campusbot-btn svg { width: 28px; height: 28px; fill: white; }

    #campusbot-frame {
      position: fixed;
      ${POSITION.includes('bottom') ? 'bottom: 100px;' : 'top: 100px;'}
      ${POSITION.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      width: 380px;
      height: 550px;
      border: none;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      display: none;
      z-index: 99998;
      background: #09090b;
    }
    #campusbot-frame.open { display: block; }

    @media (max-width: 420px) {
      #campusbot-frame {
        width: calc(100vw - 16px);
        height: calc(100vh - 120px);
        ${POSITION.includes('right') ? 'right: 8px;' : 'left: 8px;'}
      }
    }
  `;
  document.head.appendChild(styles);

  // Create container
  const container = document.createElement('div');
  container.id = 'campusbot-container';

  // Create toggle button
  const btn = document.createElement('button');
  btn.id = 'campusbot-btn';
  btn.setAttribute('aria-label', 'Open QuestAI');
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l4.93-1.36C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm2.07-7.75-.9.92C11.45 10.9 11 11.5 11 13h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H6c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`;

  // Create iframe
  const frame = document.createElement('iframe');
  frame.id = 'campusbot-frame';
  frame.src = `${API_URL.replace('/api', '')}/widget.html`;
  frame.title = 'QuestAI Chat';

  // Toggle functionality
  btn.addEventListener('click', () => {
    frame.classList.toggle('open');
  });

  // Append to DOM
  container.appendChild(btn);
  container.appendChild(frame);
  document.body.appendChild(container);

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') frame.classList.remove('open');
  });

  // Expose API for external control
  window.QuestAI = {
    open: () => frame.classList.add('open'),
    close: () => frame.classList.remove('open'),
    toggle: () => frame.classList.toggle('open'),
    getSessionId: () => sessionId
  };
})();
