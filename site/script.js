const scriptBaseUrl = new URL(".", document.currentScript.src);
const siteRootUrl = new URL("../", scriptBaseUrl);
window.siteRootUrl = siteRootUrl;
window.resolveSiteUrl = (path) => new URL(path, siteRootUrl).href;

const renderLastUpdated = () => {
  const lastUpdatedTargets = document.querySelectorAll(".last-updated");
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
};

const setSiteContent = (site) => {
  const pageName = window.location.pathname.split("/").pop() || "index.html";
  const pageConfig = site.pages?.[pageName];
  const pageTitle = pageConfig?.title;
  document.title = pageConfig
    ? (pageTitle ? `${pageTitle} | ${site.name}` : (site.site_title || site.name))
    : `${document.title} | ${site.name}`;
  const description = document.querySelector('meta[name="description"]');
  if (description && pageConfig?.description) {
    description.content = pageConfig.description;
  }

  document.querySelectorAll("[data-site-nav]").forEach((nav) => {
    nav.innerHTML = "";
    const container = document.createElement("div");
    container.className = "container topbar-inner";
    const home = document.createElement("a");
    home.className = "site-name";
    home.href = new URL("index.html", siteRootUrl).href;
    home.textContent = site.name;
    const actions = document.createElement("div");
    actions.className = "topbar-actions";
    const dropdown = document.createElement("div");
    dropdown.className = "menu-dropdown";
    const button = document.createElement("button");
    button.className = "menu-button";
    button.id = "menuToggle";
    button.setAttribute("aria-label", "Toggle menu");
    button.setAttribute("aria-haspopup", "true");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "topMenu");
    button.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i><span>Menu</span>';
    const list = document.createElement("ul");
    list.className = "menu-list";
    list.id = "topMenu";
    list.hidden = true;
    (site.navigation || []).forEach((item) => {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.href = new URL(item.path, siteRootUrl).href;
      link.textContent = item.label;
      listItem.appendChild(link);
      list.appendChild(listItem);
    });
    dropdown.append(button, list);
    actions.appendChild(dropdown);
    container.append(home, actions);
    nav.appendChild(container);
  });

  document.querySelectorAll("[data-site-footer]").forEach((footer) => {
    footer.innerHTML = "";
    const container = document.createElement("div");
    container.className = "container";
    const paragraph = document.createElement("p");
    paragraph.append(`© ${site.copyright_year} ${site.name} · ${site.footer_text} `);
    const updated = document.createElement("span");
    updated.className = "last-updated";
    updated.textContent = "--";
    paragraph.appendChild(updated);
    container.appendChild(paragraph);
    footer.appendChild(container);
  });
  renderLastUpdated();

  const aboutTitle = document.getElementById("aboutTitle");
  if (aboutTitle) aboutTitle.textContent = `About ${site.short_name || site.name}`;
  const bio = document.getElementById("aboutBio");
  if (bio) bio.innerHTML = site.bio_html || "";
  const profileImage = document.getElementById("profileImage");
  if (profileImage) {
    profileImage.src = new URL(site.profile_image, siteRootUrl).href;
    profileImage.alt = site.profile_image_alt || `${site.name} profile photo`;
  }

  const contact = document.getElementById("aboutContact");
  if (contact) {
    contact.innerHTML = '<p class="about-contact-title">Contact</p>';
    (site.contact || []).forEach((line) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = line;
      contact.appendChild(paragraph);
    });
  }

  const socialLinks = document.getElementById("socialLinks");
  if (socialLinks) {
    socialLinks.innerHTML = "";
    (site.social_links || []).forEach((item) => {
      const link = document.createElement("a");
      link.className = `social-link${item.image ? " social-link-logo" : ""}`;
      link.href = item.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", item.label);
      if (item.image) {
        const image = document.createElement("img");
        image.className = item.image_class || "";
        image.src = new URL(item.image, siteRootUrl).href;
        image.alt = item.image_alt || item.label;
        link.appendChild(image);
      } else {
        const icon = document.createElement("i");
        icon.className = item.icon;
        icon.setAttribute("aria-hidden", "true");
        link.appendChild(icon);
      }
      socialLinks.appendChild(link);
    });
  }

  document.querySelectorAll("[data-site-field]").forEach((node) => {
    node.textContent = site[node.dataset.siteField] || "";
  });
};

window.siteConfigPromise = fetch(new URL("content/site.json", siteRootUrl), { cache: "no-store" })
  .then((response) => {
    if (!response.ok) throw new Error("Failed to fetch site data.");
    return response.json();
  })
  .then((site) => {
    setSiteContent(site);
    return site;
  });

const initializeMenu = () => {
  const menuToggle = document.getElementById("menuToggle");
  const topMenu = document.getElementById("topMenu");
  if (!menuToggle || !topMenu) return;
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
};

window.siteConfigPromise.then(initializeMenu).catch(() => {});
