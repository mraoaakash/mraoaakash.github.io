const projectsList = document.getElementById("projectsList");

const initializeProjects = async () => {
  if (!projectsList) return;

  try {
    const response = await fetch(window.resolveSiteUrl("content/projects.json"), { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch projects data.");
    const projects = await response.json();
    projectsList.innerHTML = "";

    projects.forEach((project) => {
      const link = document.createElement("a");
      link.className = "project-item-link";
      link.href = window.resolveSiteUrl(project.url);

      const article = document.createElement("article");
      article.className = "project-item";
      article.id = project.id;

      const image = document.createElement("img");
      image.src = window.resolveSiteUrl(project.image);
      image.alt = project.image_alt || "";
      image.loading = "lazy";

      const content = document.createElement("div");
      const title = document.createElement("h2");
      title.textContent = project.title;
      const summary = document.createElement("p");
      summary.textContent = project.summary;

      content.append(title, summary);
      article.append(image, content);
      link.appendChild(article);
      projectsList.appendChild(link);
    });
  } catch {
    projectsList.innerHTML = '<p class="content-load-error">Unable to load projects right now.</p>';
  }
};

initializeProjects();
