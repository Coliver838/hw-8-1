import { products } from "../../data.js";
import productsTemplate from "../templates/products.hbs";
import "../styles.css";

const BOOKMARKS_KEY = "hw8-bookmarks";
const PROFILE_KEY = "hw8-profile";

const bookmarkForm = document.querySelector("#bookmark-form");
const bookmarksList = document.querySelector("#bookmarks-list");
const bookmarkTitle = document.querySelector("#bookmark-title");
const bookmarkUrl = document.querySelector("#bookmark-url");
const bookmarkSubmit = document.querySelector("#bookmark-submit");
const bookmarkCancel = document.querySelector("#bookmark-cancel");
const bookmarkMessage = document.querySelector("#bookmark-message");
const profileForm = document.querySelector("#profile-form");
const profileMessage = document.querySelector("#profile-message");
const productSearch = document.querySelector("#product-search");
const productsList = document.querySelector("#products-list");
const productsCount = document.querySelector("#products-count");

let editingId = null;

function getBookmarks() {
  try {
    const savedBookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY));
    return Array.isArray(savedBookmarks) ? savedBookmarks : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

function renderBookmarks() {
  const bookmarks = getBookmarks();
  bookmarksList.innerHTML = "";

  if (!bookmarks.length) {
    bookmarksList.innerHTML =
      '<li class="empty-state">Закладок ще немає. Додайте першу за допомогою форми.</li>';
    return;
  }

  bookmarks.forEach(({ id, title, url }) => {
    const item = document.createElement("li");
    item.className = "bookmark-item";
    item.innerHTML = `<a href="${url}" target="_blank" rel="noreferrer">${title}</a>
      <div class="bookmark-actions">
        <button class="button-secondary" type="button" data-action="edit" data-id="${id}">Редагувати</button>
        <button class="button-danger" type="button" data-action="delete" data-id="${id}">Видалити</button>
      </div>`;
    bookmarksList.append(item);
  });
}

function resetBookmarkForm() {
  editingId = null;
  bookmarkForm.reset();
  bookmarkSubmit.textContent = "Додати";
  bookmarkCancel.hidden = true;
}

bookmarkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = bookmarkTitle.value.trim();
  const url = bookmarkUrl.value.trim();
  const bookmarks = getBookmarks();

  if (editingId) {
    const bookmark = bookmarks.find((item) => item.id === editingId);
    Object.assign(bookmark, { title, url });
    bookmarkMessage.textContent = "Закладку відредаговано.";
  } else {
    bookmarks.push({ id: crypto.randomUUID(), title, url });
    bookmarkMessage.textContent = "Закладку додано.";
  }

  saveBookmarks(bookmarks);
  renderBookmarks();
  resetBookmarkForm();
});

bookmarksList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const bookmarks = getBookmarks();
  const id = button.dataset.id;
  if (button.dataset.action === "delete") {
    saveBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
    bookmarkMessage.textContent = "Закладку видалено.";
    if (editingId === id) resetBookmarkForm();
    renderBookmarks();
    return;
  }

  const bookmark = bookmarks.find((item) => item.id === id);
  editingId = id;
  bookmarkTitle.value = bookmark.title;
  bookmarkUrl.value = bookmark.url;
  bookmarkSubmit.textContent = "Зберегти зміни";
  bookmarkCancel.hidden = false;
  bookmarkTitle.focus();
});

bookmarkCancel.addEventListener("click", resetBookmarkForm);

function loadProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY));
    if (!profile) return;
    profileForm.elements.login.value = profile.login || "";
    profileForm.elements.password.value = profile.password || "";
  } catch {
    localStorage.removeItem(PROFILE_KEY);
  }
}

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(profileForm);
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      login: formData.get("login").trim(),
      password: formData.get("password"),
    }),
  );
  profileMessage.textContent =
    "Дані збережено. Оновіть сторінку, щоб перевірити.";
});

function renderProducts(query = "") {
  const normalizedQuery = query.trim().toLocaleLowerCase("uk-UA");
  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.description}`
      .toLocaleLowerCase("uk-UA")
      .includes(normalizedQuery),
  );
  productsList.innerHTML = productsTemplate({ products: filteredProducts });
  productsCount.textContent = `Знайдено: ${filteredProducts.length}`;
}

productSearch.addEventListener("input", (event) =>
  renderProducts(event.target.value),
);

renderBookmarks();
loadProfile();
renderProducts();
