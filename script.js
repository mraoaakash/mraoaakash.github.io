const menuToggle = document.getElementById("menuToggle");
const topMenu = document.getElementById("topMenu");
const lastUpdatedTargets = document.querySelectorAll(".last-updated");

if (lastUpdatedTargets.length > 0) {
  const parsedLastModified = new Date(document.lastModified);
  const safeDate = Number.isNaN(parsedLastModified.getTime()) ? new Date() : parsedLastModified;
  const formattedLastUpdated = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(safeDate);

  lastUpdatedTargets.forEach((target) => {
    target.textContent = formattedLastUpdated;
  });
}

if (menuToggle && topMenu) {
  const icon = menuToggle.querySelector("i");

  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    topMenu.hidden = !isOpen;

    if (icon) {
      icon.classList.toggle("fa-bars", !isOpen);
      icon.classList.toggle("fa-bars-staggered", isOpen);
    }
  };

  setMenuOpen(false);

  menuToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!topMenu.hidden && target instanceof Node && !topMenu.contains(target) && !menuToggle.contains(target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !topMenu.hidden) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}
