
document.addEventListener("DOMContentLoaded", async () => {
  const includes = [...document.querySelectorAll("[data-include]")];
  await Promise.all(includes.map(async el => {
    try {
      const response = await fetch(el.dataset.include);
      if (!response.ok) throw new Error("Include failed");
      el.innerHTML = await response.text();
    } catch (error) {
      el.innerHTML = "<p class='include-error'>This page must be viewed through a web server for shared includes to load.</p>";
    }
  }));

  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  const menuButton = document.querySelector(".mobile-menu-button");
  const menu = document.querySelector(".mobile-menu");
  const setMenu = open => {
    if (!menu || !menuButton) return;
    menu.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuButton?.addEventListener("click", () => setMenu(menu.hidden));
  menu?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => { if (event.key === "Escape") setMenu(false); });

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }), { threshold: .12 })
    : null;
  document.querySelectorAll(".reveal").forEach(el => observer ? observer.observe(el) : el.classList.add("visible"));

  const modal = document.querySelector(".portfolio-modal");
  const modalImage = modal?.querySelector(".modal-image");
  const modalTitle = modal?.querySelector(".modal-copy h2");
  const modalDescription = modal?.querySelector(".modal-copy p");
  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  };
  document.querySelectorAll(".portfolio-card").forEach(card => card.addEventListener("click", () => {
    if (!modal || !modalImage || !modalTitle || !modalDescription) return;
    modalImage.src = card.dataset.src;
    modalImage.alt = card.dataset.title;
    modalTitle.textContent = card.dataset.title;
    modalDescription.textContent = card.dataset.description;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close")?.focus();
  }));
  modal?.querySelector(".modal-close")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && modal && !modal.hidden) closeModal(); });
});
