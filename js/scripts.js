
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

// careers
document.addEventListener("DOMContentLoaded", () => {
  const careerList = document.querySelector("#career-list");
  const careerCards = [...document.querySelectorAll(".career-card")];
  const careerModal = document.querySelector(".career-modal");

  if (!careerList || !careerCards.length || !careerModal) return;

  const positionFilter = document.querySelector("#career-filter-position");
  const locationFilter = document.querySelector("#career-filter-location");
  const typeFilter = document.querySelector("#career-filter-type");
  const rangeFilter = document.querySelector("#career-filter-range");
  const filterForm = document.querySelector(".career-filters");
  const resultCount = document.querySelector(".career-result-count");
  const emptyState = document.querySelector(".career-empty");

  const careerModalTitle = careerModal.querySelector("#career-modal-title");
  const careerModalMeta = careerModal.querySelector(".career-modal-meta");
  const careerModalDescription = careerModal.querySelector(".career-modal-description");
  const careerModalClose = careerModal.querySelector(".career-modal-close");
  const resumeUploadUrl = document.body.dataset.resumeUploadUrl?.trim() || "";

  let activeCareerCard = null;
  let returnFocus = null;

  const uniqueSorted = values =>
    [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const addOptions = (select, values) => {
    if (!select) return;

    uniqueSorted(values).forEach(value => {
      const option = document.createElement("option");
      option.value = value.toLowerCase();
      option.textContent = value;
      select.append(option);
    });
  };

  addOptions(positionFilter, careerCards.map(card => card.dataset.position));
  addOptions(
    locationFilter,
    careerCards.flatMap(card => (card.dataset.locations || "").split("|"))
  );
  addOptions(typeFilter, careerCards.map(card => card.dataset.salaryType));

  const salaryMatches = (card, range) => {
    if (!range) return true;

    const minimum = Number.parseFloat(card.dataset.salaryMin);
    const maximum = Number.parseFloat(card.dataset.salaryMax);
    const hasSalary = Number.isFinite(minimum) || Number.isFinite(maximum);

    if (range === "tbd") return !hasSalary;

    const low = Number.isFinite(minimum) ? minimum : maximum;
    const high = Number.isFinite(maximum) ? maximum : minimum;

    if (!Number.isFinite(low) || !Number.isFinite(high)) return false;
    if (range === "under-20") return low < 20;
    if (range === "20-30") return high >= 20 && low <= 30;
    if (range === "30-50") return high >= 30 && low <= 50;
    if (range === "50-plus") return high >= 50;

    return true;
  };

  const applyCareerFilters = () => {
    const position = positionFilter?.value || "";
    const location = locationFilter?.value || "";
    const salaryType = typeFilter?.value || "";
    const salaryRange = rangeFilter?.value || "";

    let shown = 0;

    careerCards.forEach(card => {
      const cardPosition = (card.dataset.position || "").toLowerCase();
      const cardLocations = (card.dataset.locations || "")
        .split("|")
        .map(value => value.toLowerCase());
      const cardSalaryType = (card.dataset.salaryType || "").toLowerCase();

      const matches =
        (!position || cardPosition === position) &&
        (!location || cardLocations.includes(location)) &&
        (!salaryType || cardSalaryType === salaryType) &&
        salaryMatches(card, salaryRange);

      card.hidden = !matches;
      if (matches) shown += 1;
    });

    if (resultCount) {
      resultCount.textContent =
        `${shown} ${shown === 1 ? "position" : "positions"} shown`;
    }

    if (emptyState) emptyState.hidden = shown !== 0;
  };

  [positionFilter, locationFilter, typeFilter, rangeFilter].forEach(select => {
    select?.addEventListener("change", applyCareerFilters);
  });

  filterForm?.addEventListener("reset", () => {
    window.setTimeout(applyCareerFilters, 0);
  });

  const createMetaRow = (label, value) => {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    term.textContent = label;
    description.textContent = value;
    wrapper.append(term, description);

    return wrapper;
  };

  const getMetaValue = (card, label) => {
    const items = [...card.querySelectorAll(".career-meta div")];
    const match = items.find(
      item => item.querySelector("dt")?.textContent.trim() === label
    );

    return match?.querySelector("dd")?.textContent.trim() || "";
  };

  const openCareerModal = card => {
    if (
      !card ||
      !careerModalTitle ||
      !careerModalMeta ||
      !careerModalDescription
    ) return;

    activeCareerCard = card;
    returnFocus = document.activeElement;

    const title =
      card.dataset.position ||
      card.querySelector(".career-title")?.textContent.trim() ||
      "Position";

    const details = card.querySelector(".career-details-template");

    careerModalTitle.textContent = title;
    careerModalMeta.replaceChildren(
      createMetaRow("Position", title),
      createMetaRow("Location", getMetaValue(card, "Location")),
      createMetaRow("Date posted", getMetaValue(card, "Date posted")),
      createMetaRow("Closing date", getMetaValue(card, "Closing date")),
      createMetaRow("Salary type", getMetaValue(card, "Salary type")),
      createMetaRow("Salary", getMetaValue(card, "Salary"))
    );

    careerModalDescription.innerHTML = details?.innerHTML || "";
    careerModal.hidden = false;
    document.body.classList.add("career-modal-open");
    careerModalClose?.focus();
  };

  const closeCareerModal = () => {
    careerModal.hidden = true;
    document.body.classList.remove("career-modal-open");
    activeCareerCard = null;

    if (returnFocus instanceof HTMLElement) returnFocus.focus();
  };

  careerCards.forEach(card => {
    card.querySelectorAll(".career-title, .career-open").forEach(button => {
      button.addEventListener("click", () => openCareerModal(card));
    });
  });

  careerModalClose?.addEventListener("click", closeCareerModal);

  careerModal.addEventListener("click", event => {
    if (event.target === careerModal) closeCareerModal();
  });

  careerModal.querySelectorAll(".career-share").forEach(button => {
    button.addEventListener("click", async () => {
      if (!activeCareerCard) return;

      const position = activeCareerCard.dataset.position || "Position";
      const title = `${position} at Fox & Timber`;
      const text =
        `Review this career opportunity with Fox & Timber. ` +
        `Applications close ${getMetaValue(activeCareerCard, "Closing date")}.`;

      const url =
        `${window.location.href.split("#")[0]}#` +
        encodeURIComponent(position.toLowerCase().replace(/\s+/g, "-"));

      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
        }
      }

      window.location.href =
        `mailto:?subject=${encodeURIComponent(title)}` +
        `&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
    });
  });

  careerModal.querySelectorAll(".career-resume").forEach(button => {
    button.addEventListener("click", () => {
      if (resumeUploadUrl) {
        window.open(resumeUploadUrl, "_blank", "noopener,noreferrer");
        return;
      }

      window.alert(
        "The rÃ©sumÃ© upload portal has not been connected yet. " +
        "Add your Dropbox File Request, Google Form, or other upload URL " +
        "to the data-resume-upload-url attribute on careers.html."
      );
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !careerModal.hidden) {
      closeCareerModal();
      return;
    }

    if (event.key !== "Tab" || careerModal.hidden) return;

    const focusable = [...careerModal.querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    )].filter(element => element.offsetParent !== null);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  applyCareerFilters();
});

// privacy choices
document.addEventListener("DOMContentLoaded",()=>{const controls=document.querySelector("#privacy-controls");if(!controls)return;const storageKey="foxTimberConsent";const status=document.querySelector("#privacy-saved-status");const toggles={preferences:controls.querySelector('[name="preferences"]'),analytics:controls.querySelector('[name="analytics"]'),marketing:controls.querySelector('[name="marketing"]')};const defaults={essential:true,preferences:false,analytics:false,marketing:false,updatedAt:null};const readConsent=()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey));return{...defaults,...(saved||{}),essential:true}}catch(error){return{...defaults}}};const renderConsent=consent=>{Object.entries(toggles).forEach(([name,input])=>{if(input)input.checked=Boolean(consent[name])});window.foxTimberConsent=consent};const announce=message=>{if(!status)return;status.textContent=message;window.setTimeout(()=>{if(status.textContent===message)status.textContent=""},5000)};const saveConsent=values=>{const consent={essential:true,preferences:Boolean(values.preferences),analytics:Boolean(values.analytics),marketing:Boolean(values.marketing),updatedAt:new Date().toISOString()};try{localStorage.setItem(storageKey,JSON.stringify(consent))}catch(error){announce("Your browser prevented these choices from being stored.");return}renderConsent(consent);announce("Your privacy choices have been saved.");window.dispatchEvent(new CustomEvent("foxTimberConsentChanged",{detail:consent}))};controls.querySelector('[data-privacy-action="save"]')?.addEventListener("click",()=>saveConsent({preferences:toggles.preferences?.checked,analytics:toggles.analytics?.checked,marketing:toggles.marketing?.checked}));controls.querySelector('[data-privacy-action="accept"]')?.addEventListener("click",()=>saveConsent({preferences:true,analytics:true,marketing:true}));controls.querySelector('[data-privacy-action="reject"]')?.addEventListener("click",()=>saveConsent({preferences:false,analytics:false,marketing:false}));renderConsent(readConsent())});

