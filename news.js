const homeNewsList = document.getElementById("homeNewsList");
const fullNewsList = document.getElementById("newsList");
const newsCount = document.getElementById("newsCount");

const NEWS_DATA_PATH = "assets/data/news.json";
const NEWS_ASSET_BASE_PATH = "assets/images/news/";
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parseNewsDate = (dateValue) => {
  if (typeof dateValue !== "string" || !dateValue.trim()) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsed = Date.parse(`${dateValue}T00:00:00Z`);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

const sortByLatestFirst = (left, right) => {
  const leftTime = parseNewsDate(left.date);
  const rightTime = parseNewsDate(right.date);
  return rightTime - leftTime;
};

const formatNewsDate = (dateValue) => {
  const parsed = Date.parse(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(parsed)) {
    return dateValue;
  }

  const date = new Date(parsed);
  const month = MONTH_LABELS[date.getUTCMonth()];
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${month}'${year}`;
};

const getNewsAssetPath = (assetName) => {
  if (typeof assetName !== "string" || !assetName.trim()) {
    return "";
  }

  const cleaned = assetName.trim().split("/").pop();
  return cleaned ? `${NEWS_ASSET_BASE_PATH}${encodeURIComponent(cleaned)}` : "";
};

const createNewsMediaNode = ({ path, text, type }) => {
  const media = document.createElement("img");
  media.className = type === "gif" ? "news-item-gif" : "news-item-image";
  media.src = path;
  media.alt = text || (type === "gif" ? "News GIF" : "News image");
  media.loading = "lazy";
  return media;
};

const createNewsItem = (item, options = {}) => {
  const { showMedia = false } = options;
  const article = document.createElement("article");
  article.className = "news-item";

  const paragraph = document.createElement("p");
  const dateBadge = document.createElement("span");
  dateBadge.className = "news-date";
  dateBadge.textContent = formatNewsDate(item.date || "");

  const textContent = document.createElement("span");
  textContent.className = "news-text";
  textContent.appendChild(document.createTextNode(item.text || ""));

  paragraph.appendChild(dateBadge);
  paragraph.appendChild(textContent);

  if (typeof item.url === "string" && item.url.trim()) {
    const link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.url_label || "Read more";
    if (item.url.startsWith("http://") || item.url.startsWith("https://")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    textContent.appendChild(document.createTextNode(" "));
    textContent.appendChild(link);
  }

  article.appendChild(paragraph);

  if (showMedia) {
    const imagePath = getNewsAssetPath(item.image);
    if (imagePath) {
      textContent.appendChild(createNewsMediaNode({ path: imagePath, text: item.text, type: "image" }));
    }

    const gifPath = getNewsAssetPath(item.gif);
    if (gifPath) {
      textContent.appendChild(createNewsMediaNode({ path: gifPath, text: item.text, type: "gif" }));
    }
  }

  return article;
};

const renderNewsItems = (target, items, options = {}) => {
  if (!target) {
    return;
  }

  target.innerHTML = "";
  items.forEach((item) => {
    target.appendChild(createNewsItem(item, options));
  });
};

const renderMessage = (target, message) => {
  if (!target) {
    return;
  }

  target.innerHTML = "";
  const article = document.createElement("article");
  article.className = "news-item";

  const paragraph = document.createElement("p");
  paragraph.className = "news-empty";
  paragraph.textContent = message;

  article.appendChild(paragraph);
  target.appendChild(article);
};

const initializeNews = async () => {
  if (!homeNewsList && !fullNewsList) {
    return;
  }

  try {
    const response = await fetch(NEWS_DATA_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to fetch news data.");
    }

    const data = await response.json();
    const newsItems = Array.isArray(data) ? data.slice().sort(sortByLatestFirst) : [];

    if (newsCount) {
      newsCount.textContent = `${newsItems.length} update${newsItems.length === 1 ? "" : "s"}`;
    }

    if (newsItems.length === 0) {
      renderMessage(homeNewsList, "No news yet.");
      renderMessage(fullNewsList, "No news yet.");
      return;
    }

    renderNewsItems(homeNewsList, newsItems.slice(0, 5));
    renderNewsItems(fullNewsList, newsItems, { showMedia: true });
  } catch {
    renderMessage(homeNewsList, "Unable to load news right now.");
    renderMessage(fullNewsList, "Unable to load news right now.");
    if (newsCount) {
      newsCount.textContent = "";
    }
  }
};

initializeNews();
