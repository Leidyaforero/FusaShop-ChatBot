export function showModal(contentHtml) {
  const root = document.getElementById("modalRoot");
  if (!root) return;
  root.innerHTML = `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-panel">
        ${contentHtml}
        <button id="closeModal">Cerrar</button>
      </div>
    </div>
  `;
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("closeModal");
  closeBtn?.addEventListener("click", clearModal);
  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) clearModal();
  });
}

export function clearModal() {
  const root = document.getElementById("modalRoot");
  if (root) root.innerHTML = "";
}
