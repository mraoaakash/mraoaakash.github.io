const cvContent = document.getElementById("cvContent");
const FLAG_BASE_URL = "https://cdn.jsdelivr.net/npm/flagpack-core@2.0.0/svg/l/";

const createCvEntry = (entry) => {
  const article = document.createElement("article");
  article.className = "cv-li-entry";

  const logo = document.createElement("img");
  logo.className = "cv-li-logo";
  logo.src = window.resolveSiteUrl(entry.logo);
  logo.alt = entry.logo_alt || "";

  const content = document.createElement("div");
  content.className = "cv-li-content";
  const title = document.createElement("p");
  title.className = "cv-li-title";
  title.textContent = entry.title;
  const organization = document.createElement("p");
  organization.className = "cv-li-org";
  organization.textContent = entry.organization;
  const meta = document.createElement("p");
  meta.className = "cv-li-meta";
  const dates = document.createElement("span");
  dates.className = "cv-date-badge";
  dates.textContent = entry.dates;
  meta.appendChild(dates);

  if (entry.flag) {
    const flag = document.createElement("img");
    flag.className = "cv-flag";
    flag.src = `${FLAG_BASE_URL}${encodeURIComponent(entry.flag)}.svg`;
    flag.alt = entry.flag_alt || "Country flag";
    meta.append(" ", flag);
  }

  content.append(title, organization, meta);
  if (Array.isArray(entry.bullets) && entry.bullets.length) {
    const bullets = document.createElement("ul");
    bullets.className = "cv-li-bullets";
    entry.bullets.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      bullets.appendChild(item);
    });
    content.appendChild(bullets);
  }
  article.append(logo, content);
  return article;
};

const initializeCv = async () => {
  if (!cvContent) return;
  try {
    const response = await fetch(window.resolveSiteUrl("content/cv.json"), { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch CV data.");
    const sections = await response.json();
    cvContent.innerHTML = "";
    sections.forEach((sectionData, index) => {
      const section = document.createElement("section");
      section.className = "cv-section";
      const heading = document.createElement("h2");
      heading.id = `cv-section-${index}`;
      heading.textContent = sectionData.title;
      section.setAttribute("aria-labelledby", heading.id);
      section.appendChild(heading);
      (sectionData.entries || []).forEach((entry) => section.appendChild(createCvEntry(entry)));
      cvContent.appendChild(section);
    });
  } catch {
    cvContent.innerHTML = '<p class="content-load-error">Unable to load CV content right now.</p>';
  }
};

initializeCv();
