// ==========================================
// ЕДИНЫЙ JS ДЛЯ ПРОЕКТА "НОУМЕН"
// ==========================================

(function () {
  "use strict";

  // ==========================================
  // 0. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ==========================================

  window.escapeHtml = function (str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  // ==========================================
  // 1. СИСТЕМА ПОЛЬЗОВАТЕЛЕЙ
  // ==========================================

  const USERS_KEY = "noumen_users";
  const CURRENT_USER_KEY = "noumen_current_user";

  function initDefaultUser() {
    const users = getUsers();
    const mariaExists = users.some((user) => user.email === "maria@gmail.com");
    if (!mariaExists) {
      users.push({
        id: 1,
        email: "maria@gmail.com",
        password: "123",
        nickname: "Мария",
        createdAt: new Date().toISOString(),
      });
      saveUsers(users);
      console.log("✅ Пользователь Мария создан!");
    }
  }

  function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function registerUser(email, password, nickname) {
    const users = getUsers();
    if (users.some((user) => user.email === email)) {
      return {
        success: false,
        message: "Пользователь с таким email уже существует",
      };
    }
    users.push({
      id: Date.now(),
      email: email,
      password: password,
      nickname: nickname || email.split("@")[0],
      createdAt: new Date().toISOString(),
    });
    saveUsers(users);
    return { success: true, message: "Регистрация успешна!" };
  }

  function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (user) {
      const currentUser = { ...user };
      delete currentUser.password;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      return { success: true, message: "Вход выполнен!" };
    }
    return { success: false, message: "Неверный email или пароль" };
  }

  window.logoutUser = function () {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = "index.html";
  };

  window.getCurrentUser = function () {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  };

  window.isAuthenticated = function () {
    return window.getCurrentUser() !== null;
  };

  // ==========================================
  // 2. РЕГИСТРАЦИЯ
  // ==========================================

  function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    const emailInput = document.getElementById("email");
    const pwdInput = document.getElementById("password");
    const pwd2Input = document.getElementById("confirm_password");
    const nicknameInput = document.getElementById("nickname");
    const errorDiv = document.getElementById("passwordError");

    if (pwd2Input) {
      pwd2Input.addEventListener("input", function () {
        if (pwdInput.value !== pwd2Input.value) {
          if (errorDiv) errorDiv.classList.add("show");
          pwd2Input.classList.add("register-input-error");
        } else {
          if (errorDiv) errorDiv.classList.remove("show");
          pwd2Input.classList.remove("register-input-error");
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = pwdInput.value;
      const password2 = pwd2Input?.value || "";
      const nickname = nicknameInput?.value.trim() || "";

      if (!email) return alert("Введите email");
      if (!password) return alert("Введите пароль");
      if (password !== password2) return alert("Пароли не совпадают");
      if (password.length < 3)
        return alert("Пароль должен быть не менее 3 символов");

      const result = registerUser(email, password, nickname);
      if (result.success) {
        alert(result.message);
        loginUser(email, password);
        window.location.href = "profile.html";
      } else {
        alert(result.message);
      }
    });
  }

  // ==========================================
  // 3. ВХОД
  // ==========================================

  function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      if (!email) return alert("Введите email");
      if (!password) return alert("Введите пароль");

      const result = loginUser(email, password);
      if (result.success) {
        alert(result.message);
        window.location.href = "profile.html";
      } else {
        alert(result.message);
      }
    });
  }

  // ==========================================
  // 4. ПРОФИЛЬ
  // ==========================================

  function initProfileForm() {
    const form = document.getElementById("profileForm");
    if (!form) return;

    const currentUser = window.getCurrentUser();
    if (!currentUser) {
      window.location.href = "login.html";
      return;
    }

    const nicknameInput = document.getElementById("nickname");
    const emailInput = document.getElementById("email");
    const cancelBtn = document.getElementById("cancelBtn");
    const msg = document.getElementById("saveMessage");

    if (nicknameInput) nicknameInput.value = currentUser.nickname || "";
    if (emailInput) {
      emailInput.value = currentUser.email;
      emailInput.readOnly = true;
    }

    let original = { nickname: nicknameInput?.value || "" };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const newNickname = nicknameInput.value.trim();
      if (!newNickname) {
        showProfileMsg("Никнейм не может быть пустым", "error");
        return;
      }

      const users = getUsers();
      const userIndex = users.findIndex((u) => u.email === currentUser.email);
      if (userIndex !== -1) {
        users[userIndex].nickname = newNickname;
        saveUsers(users);

        const updatedUser = { ...users[userIndex] };
        delete updatedUser.password;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

        original.nickname = newNickname;
        showProfileMsg("Данные сохранены", "success");
      }
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        nicknameInput.value = original.nickname;
        showProfileMsg("Изменения отменены", "success");
      });
    }

    function showProfileMsg(text, type) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = "save-message " + type;
      setTimeout(() => {
        msg.textContent = "";
        msg.className = "save-message";
      }, 3000);
    }
  }

  function addLogoutButton() {
    const profileContainer = document.querySelector(".profile-form-container");
    if (profileContainer && !document.getElementById("logoutBtn")) {
      const logoutBtn = document.createElement("button");
      logoutBtn.id = "logoutBtn";
      logoutBtn.textContent = "Выйти из аккаунта";
      logoutBtn.className = "btn-cancel";
      logoutBtn.style.marginTop = "20px";
      logoutBtn.style.width = "100%";
      logoutBtn.style.padding = "10px 24px";
      logoutBtn.style.cursor = "pointer";
      logoutBtn.onclick = function () {
        if (confirm("Вы уверены, что хотите выйти?")) {
          window.logoutUser();
        }
      };
      profileContainer.appendChild(logoutBtn);
    }
  }

  // ==========================================
  // 5. ЛАЙКИ (СЕРДЕЧКИ)
  // ==========================================

  const STORAGE_KEY = "likedQuotes";

  function getLikedQuotes() {
    if (!window.isAuthenticated()) return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  function saveLikedQuote(quoteData) {
    if (!window.isAuthenticated()) {
      alert("Пожалуйста, войдите в аккаунт, чтобы сохранять цитаты");
      return false;
    }
    let quotes = getLikedQuotes();
    if (!quotes.some((q) => q.text === quoteData.text)) {
      quotes.push(quoteData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    }
    return true;
  }

  function removeLikedQuote(quoteText) {
    if (!window.isAuthenticated()) return false;
    let quotes = getLikedQuotes();
    quotes = quotes.filter((q) => q.text !== quoteText);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    return true;
  }

  function updateAllHearts() {
    if (!window.isAuthenticated()) {
      document
        .querySelectorAll(".heart-btn")
        .forEach((btn) => btn.classList.remove("liked"));
      return;
    }
    const likedQuotes = getLikedQuotes();
    document.querySelectorAll(".quote-card").forEach((card) => {
      const heartBtn = card.querySelector(".heart-btn");
      const quoteText = card.querySelector(".quote-text")?.textContent || "";
      if (heartBtn) {
        if (likedQuotes.some((q) => q.text === quoteText)) {
          heartBtn.classList.add("liked");
        } else {
          heartBtn.classList.remove("liked");
        }
      }
    });
  }

  function initHearts() {
    document.querySelectorAll(".heart-btn").forEach((btn) => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener("click", function (e) {
        e.stopPropagation();

        if (!window.isAuthenticated()) {
          alert("Чтобы сохранять цитаты, пожалуйста, войдите в аккаунт");
          return;
        }

        const card = this.closest(".quote-card");
        const quoteText = card.querySelector(".quote-text")?.textContent || "";
        const authorName =
          card.querySelector(".author-name")?.textContent || "";
        const authorImg = card.querySelector(".author-avatar img")?.src || "";

        if (this.classList.contains("liked")) {
          this.classList.remove("liked");
          removeLikedQuote(quoteText);
          setTimeout(() => {
            addCopyButtons();
            updateAllHearts();
          }, 50);
        } else {
          this.classList.add("liked");
          saveLikedQuote({
            text: quoteText,
            author: authorName,
            avatar: authorImg,
            timestamp: Date.now(),
          });
          this.style.transform = "scale(1.3)";
          setTimeout(() => {
            if (this) this.style.transform = "";
          }, 200);
        }
        displaySavedQuotes();
      });
    });
    updateAllHearts();
  }

  function displaySavedQuotes() {
    const container = document.getElementById("savedQuotesContainer");
    if (!container) return;

    if (!window.isAuthenticated()) {
      container.innerHTML =
        '<p class="empty-quotes-text">Войдите в аккаунт, чтобы видеть сохранённые цитаты</p>';
      return;
    }

    const quotes = getLikedQuotes();
    if (quotes.length === 0) {
      container.innerHTML =
        '<p class="empty-quotes-text">Нет сохранённых цитат</p>';
      return;
    }
    quotes.sort((a, b) => b.timestamp - a.timestamp);
    container.innerHTML = quotes
      .map(
        (quote) => `
      <div class="quote-card">
        <div class="quote-content">
          <p class="quote-text">${window.escapeHtml(quote.text)}</p>
          <div class="quote-footer">
            <div class="quote-author">
              <div class="author-avatar">
                <img src="${window.escapeHtml(quote.avatar)}" alt="${window.escapeHtml(quote.author)}">
              </div>
              <span class="author-name">${window.escapeHtml(quote.author)}</span>
            </div>
            <button class="heart-btn liked">
              <svg class="heart-icon" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    container.querySelectorAll(".heart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!window.isAuthenticated()) {
          alert("Чтобы удалять цитаты, пожалуйста, войдите в аккаунт");
          return;
        }
        const card = btn.closest(".quote-card");
        const text = card.querySelector(".quote-text")?.textContent || "";
        removeLikedQuote(text);
        displaySavedQuotes();
        updateAllHearts();
        addCopyButtons();
      });
    });

    addCopyButtonsToContainer(container);
  }

  function addCopyButtonsToContainer(container) {
    container.querySelectorAll(".quote-card").forEach((card) => {
      if (card.querySelector(".copy-quote-btn")) return;
      const quoteFooter = card.querySelector(".quote-footer");
      if (!quoteFooter) return;
      const quoteText = card.querySelector(".quote-text")?.textContent || "";
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-quote-btn";
      copyBtn.setAttribute("aria-label", "Скопировать цитату");
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        copyToClipboard(quoteText);
      });
      quoteFooter.appendChild(copyBtn);
    });
  }

  // ==========================================
  // 6. АДМИНКА
  // ==========================================

  function initQuotesStorage() {
    if (!localStorage.getItem("suggestedQuotes"))
      localStorage.setItem("suggestedQuotes", JSON.stringify([]));
    if (!localStorage.getItem("approvedQuotes"))
      localStorage.setItem("approvedQuotes", JSON.stringify([]));
    if (!localStorage.getItem("rejectedQuotes"))
      localStorage.setItem("rejectedQuotes", JSON.stringify([]));
  }

  window.getSuggestedQuotes = function () {
    initQuotesStorage();
    return JSON.parse(localStorage.getItem("suggestedQuotes"));
  };
  window.getApprovedQuotes = function () {
    initQuotesStorage();
    return JSON.parse(localStorage.getItem("approvedQuotes"));
  };
  window.getRejectedQuotes = function () {
    initQuotesStorage();
    return JSON.parse(localStorage.getItem("rejectedQuotes"));
  };

  window.saveSuggestedQuote = function (quoteData) {
    initQuotesStorage();
    const suggested = window.getSuggestedQuotes();
    suggested.push({
      id: Date.now(),
      ...quoteData,
      status: "suggested",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("suggestedQuotes", JSON.stringify(suggested));
    return true;
  };

  window.approveQuote = function (id) {
    let suggested = window.getSuggestedQuotes();
    const idx = suggested.findIndex((q) => q.id == id);
    if (idx === -1) return false;
    const approved = window.getApprovedQuotes();
    const approvedQuote = { ...suggested[idx], status: "approved" };
    delete approvedQuote.email;
    approved.push(approvedQuote);
    localStorage.setItem("approvedQuotes", JSON.stringify(approved));
    suggested.splice(idx, 1);
    localStorage.setItem("suggestedQuotes", JSON.stringify(suggested));
    return true;
  };

  window.rejectQuote = function (id) {
    let suggested = window.getSuggestedQuotes();
    const idx = suggested.findIndex((q) => q.id == id);
    if (idx === -1) return false;
    const rejected = window.getRejectedQuotes();
    const rejectedQuote = { ...suggested[idx], status: "rejected" };
    delete rejectedQuote.email;
    rejected.push(rejectedQuote);
    localStorage.setItem("rejectedQuotes", JSON.stringify(rejected));
    suggested.splice(idx, 1);
    localStorage.setItem("suggestedQuotes", JSON.stringify(suggested));
    return true;
  };

  window.deleteApprovedQuote = function (id) {
    let approved = window.getApprovedQuotes();
    approved = approved.filter((q) => q.id != id);
    localStorage.setItem("approvedQuotes", JSON.stringify(approved));
  };

  window.deleteRejectedQuote = function (id) {
    let rejected = window.getRejectedQuotes();
    rejected = rejected.filter((q) => q.id != id);
    localStorage.setItem("rejectedQuotes", JSON.stringify(rejected));
  };

  window.editSuggestedQuote = function (id, updatedData) {
    let suggested = window.getSuggestedQuotes();
    const idx = suggested.findIndex((q) => q.id == id);
    if (idx !== -1) {
      suggested[idx] = { ...suggested[idx], ...updatedData };
      localStorage.setItem("suggestedQuotes", JSON.stringify(suggested));
      return true;
    }
    return false;
  };

  window.addQuoteByAdmin = function (quoteData) {
    initQuotesStorage();
    const approved = window.getApprovedQuotes();
    approved.push({
      id: Date.now(),
      text: quoteData.text,
      author: quoteData.author,
      authorAvatar: quoteData.authorAvatar || null,
      category: quoteData.category,
      source: null,
      status: "approved",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("approvedQuotes", JSON.stringify(approved));
  };

  function renderSuggestedList() {
    const container = document.getElementById("suggestedList");
    if (!container) return;
    const suggested = window.getSuggestedQuotes();
    if (!suggested.length) {
      container.innerHTML =
        '<p class="empty-quotes-text">Нет цитат на рассмотрении.</p>';
      return;
    }
    container.innerHTML = suggested
      .map(
        (quote) => `
      <div class="admin-quote-card" data-id="${quote.id}">
        <p><strong>Цитата:</strong> ${window.escapeHtml(quote.text)}</p>
        <p><strong>Автор:</strong> ${window.escapeHtml(quote.author)}</p>
        <p><strong>Категория:</strong> ${window.escapeHtml(quote.category)}</p>
        <p><strong>Источник:</strong> ${window.escapeHtml(quote.source || "—")}</p>
        <p><strong>Email:</strong> ${window.escapeHtml(quote.email || "—")}</p>
        <div class="admin-actions">
          <button class="approve-btn">Одобрить</button>
          <button class="reject-btn">Отклонить</button>
          <button class="edit-btn">Редактировать</button>
        </div>
      </div>
    `,
      )
      .join("");

    container.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.approveQuote(
          parseInt(btn.closest(".admin-quote-card").dataset.id),
        );
        refreshAdminPanels();
      });
    });
    container.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.rejectQuote(
          parseInt(btn.closest(".admin-quote-card").dataset.id),
        );
        refreshAdminPanels();
      });
    });
    container.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.closest(".admin-quote-card").dataset.id);
        const quote = suggested.find((q) => q.id === id);
        openEditModal(quote);
      });
    });
  }

  function renderApprovedList() {
    const container = document.getElementById("approvedList");
    if (!container) return;
    const approved = window.getApprovedQuotes();
    if (!approved.length) {
      container.innerHTML =
        '<p class="empty-quotes-text">Нет принятых цитат.</p>';
      return;
    }
    container.innerHTML = approved
      .map(
        (quote) => `
      <div class="admin-quote-card" data-id="${quote.id}">
        <p><strong>Цитата:</strong> ${window.escapeHtml(quote.text)}</p>
        <p><strong>Автор:</strong> ${window.escapeHtml(quote.author)}</p>
        <p><strong>Категория:</strong> ${window.escapeHtml(quote.category)}</p>
        <p><strong>Фото:</strong> ${quote.authorAvatar ? '<a href="' + window.escapeHtml(quote.authorAvatar) + '" target="_blank">ссылка</a>' : "—"}</p>
        <div class="admin-actions"><button class="delete-approved-btn">Удалить</button></div>
      </div>
    `,
      )
      .join("");
    container.querySelectorAll(".delete-approved-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (confirm("Удалить?")) {
          window.deleteApprovedQuote(
            parseInt(btn.closest(".admin-quote-card").dataset.id),
          );
          refreshAdminPanels();
        }
      });
    });
  }

  function renderRejectedList() {
    const container = document.getElementById("rejectedList");
    if (!container) return;
    const rejected = window.getRejectedQuotes();
    if (!rejected.length) {
      container.innerHTML =
        '<p class="empty-quotes-text">Нет отклонённых цитат.</p>';
      return;
    }
    container.innerHTML = rejected
      .map(
        (quote) => `
      <div class="admin-quote-card" data-id="${quote.id}">
        <p><strong>Цитата:</strong> ${window.escapeHtml(quote.text)}</p>
        <p><strong>Автор:</strong> ${window.escapeHtml(quote.author)}</p>
        <p><strong>Категория:</strong> ${window.escapeHtml(quote.category)}</p>
        <div class="admin-actions"><button class="delete-rejected-btn">Удалить</button></div>
      </div>
    `,
      )
      .join("");
    container.querySelectorAll(".delete-rejected-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (confirm("Удалить?")) {
          window.deleteRejectedQuote(
            parseInt(btn.closest(".admin-quote-card").dataset.id),
          );
          refreshAdminPanels();
        }
      });
    });
  }

  function refreshAdminPanels() {
    renderSuggestedList();
    renderApprovedList();
    renderRejectedList();
  }

  let currentEditId = null;

  function openEditModal(quote) {
    currentEditId = quote.id;
    document.getElementById("editQuoteId").value = quote.id;
    document.getElementById("editQuoteText").value = quote.text;
    document.getElementById("editAuthorName").value = quote.author;
    document.getElementById("editCategory").value = quote.category;
    document.getElementById("editAuthorAvatar").value =
      quote.authorAvatar || "";
    document.getElementById("editModal").style.display = "flex";
  }

  function closeModal() {
    document.getElementById("editModal").style.display = "none";
    currentEditId = null;
  }

  function saveEdit() {
    if (!currentEditId) return;
    const newText = document.getElementById("editQuoteText").value.trim();
    const newAuthor = document.getElementById("editAuthorName").value.trim();
    const newCategory = document.getElementById("editCategory").value;
    const newAvatar = document.getElementById("editAuthorAvatar").value.trim();
    if (!newText || !newAuthor) return alert("Текст и автор обязательны");
    window.editSuggestedQuote(currentEditId, {
      text: newText,
      author: newAuthor,
      category: newCategory,
      authorAvatar: newAvatar || null,
    });
    closeModal();
    refreshAdminPanels();
  }

  function initAdminPanel() {
    const addBtn = document.getElementById("adminAddQuoteBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const text = document.getElementById("adminQuoteText").value.trim();
        const author = document.getElementById("adminAuthorName").value.trim();
        const avatar = document
          .getElementById("adminAuthorAvatar")
          .value.trim();
        const category = document.getElementById("adminCategory").value;
        if (!text || !author) return alert("Заполните текст и автора");
        if (!avatar) return alert("Укажите URL фото автора");
        window.addQuoteByAdmin({
          text,
          author,
          authorAvatar: avatar,
          category,
        });
        document.getElementById("adminQuoteText").value = "";
        document.getElementById("adminAuthorName").value = "";
        document.getElementById("adminAuthorAvatar").value = "";
        refreshAdminPanels();
        alert("Цитата добавлена");
      });
    }
    const modal = document.getElementById("editModal");
    const closeBtn = document.querySelector(".close-modal");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    window.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    const saveBtn = document.getElementById("saveEditBtn");
    if (saveBtn) saveBtn.addEventListener("click", saveEdit);
    refreshAdminPanels();
  }

  // ==========================================
  // 7. ПРЕДЛОЖИТЬ ЦИТАТУ
  // ==========================================

  function initSuggestForm() {
    const form = document.getElementById("suggestForm");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const quoteText = document.getElementById("quoteText").value.trim();
      const authorName = document.getElementById("authorName").value.trim();
      const authorAvatar = document.getElementById("authorAvatar").value.trim();
      const quoteSource = document.getElementById("quoteSource").value.trim();
      const category = document.getElementById("quoteCategory").value;
      const userEmail = document.getElementById("userEmail").value.trim();
      if (!quoteText || !authorName || !category) {
        showSuggestMessage("Заполните все обязательные поля", "error");
        return;
      }
      window.saveSuggestedQuote({
        text: quoteText,
        author: authorName,
        authorAvatar: authorAvatar || null,
        source: quoteSource || null,
        category: category,
        email: userEmail || null,
      });
      showSuggestMessage("Спасибо! Цитата отправлена на модерацию.", "success");
      form.reset();
    });
  }

  function showSuggestMessage(msg, type) {
    const msgDiv = document.getElementById("formMessage");
    if (!msgDiv) return;
    msgDiv.textContent = msg;
    msgDiv.className = "form-message " + type;
    setTimeout(() => {
      msgDiv.className = "form-message";
      msgDiv.textContent = "";
    }, 5000);
  }

  // ==========================================
  // 8. КОПИРОВАНИЕ ЦИТАТЫ
  // ==========================================

  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => showCopyToast())
      .catch(() => alert("Не удалось скопировать"));
  }

  function showCopyToast() {
    let toast = document.querySelector(".copy-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "copy-toast";
      toast.textContent = "Цитата скопирована!";
      document.body.appendChild(toast);
    }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  }

  function addCopyButtons() {
    document.querySelectorAll(".quote-card").forEach((card) => {
      if (card.querySelector(".copy-quote-btn")) return;
      const quoteFooter = card.querySelector(".quote-footer");
      if (!quoteFooter) return;
      const quoteText = card.querySelector(".quote-text")?.textContent || "";
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-quote-btn";
      copyBtn.setAttribute("aria-label", "Скопировать цитату");
      copyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        copyToClipboard(quoteText);
      });
      quoteFooter.appendChild(copyBtn);
    });
  }

  // ==========================================
  // 9. ПОИСК (ПО АВТОРУ + ПО ТЕКСТУ) + ПАГИНАЦИЯ
  // ==========================================

  function initAdvancedSearch() {
    const authorSearch = document.getElementById("authorSearch");
    const textSearch = document.getElementById("textSearch");

    if (!authorSearch && !textSearch) return;

    const clearAuthorBtn = document.getElementById("clearAuthorSearch");
    const clearTextBtn = document.getElementById("clearTextSearch");
    const noResults = document.getElementById("noResults");
    const container = document.getElementById("quotesContainer");

    if (!container) return;

    let currentAuthorTerm = "";
    let currentTextTerm = "";
    let currentPage = 1;
    const PER_PAGE = 10;

    function getAllQuotes() {
      return Array.from(container.querySelectorAll(".quote-card"));
    }

    function filterQuotes() {
      let allQuotes = getAllQuotes();
      let filtered = allQuotes;

      // Фильтр по автору
      if (currentAuthorTerm !== "") {
        const term = currentAuthorTerm.toLowerCase();
        filtered = filtered.filter((card) => {
          const author = card.getAttribute("data-author")?.toLowerCase() || "";
          return author.includes(term);
        });
      }

      // Фильтр по тексту цитаты
      if (currentTextTerm !== "") {
        const term = currentTextTerm.toLowerCase();
        filtered = filtered.filter((card) => {
          const quoteText =
            card.querySelector(".quote-text")?.textContent?.toLowerCase() || "";
          return quoteText.includes(term);
        });
      }

      return filtered;
    }

    function renderFiltered() {
      const allQuotes = getAllQuotes();
      const filtered = filterQuotes();
      const end = currentPage * PER_PAGE;

      // Скрываем все
      allQuotes.forEach((q) => (q.style.display = "none"));

      // Показываем отфильтрованные (с пагинацией)
      const toShow = filtered.slice(0, end);
      toShow.forEach((q) => (q.style.display = ""));

      // Сообщение "ничего не найдено"
      if (noResults) {
        const hasSearch = currentAuthorTerm !== "" || currentTextTerm !== "";
        noResults.style.display =
          hasSearch && filtered.length === 0 ? "block" : "none";
      }

      // Кнопка "Показать больше"
      const oldBtn = container.querySelector(".show-more-btn");
      if (oldBtn) oldBtn.remove();

      if (end < filtered.length) {
        const btn = document.createElement("button");
        btn.className = "show-more-btn";
        btn.textContent = "Показать больше";
        btn.onclick = () => {
          currentPage++;
          renderFiltered();
        };
        container.appendChild(btn);
      }

      // Обновляем сердечки и кнопки копирования
      updateAllHearts();
      addCopyButtons();
    }

    // Поиск по автору
    if (authorSearch) {
      authorSearch.addEventListener("input", () => {
        currentAuthorTerm = authorSearch.value.trim();
        currentPage = 1;
        renderFiltered();
        if (clearAuthorBtn)
          clearAuthorBtn.style.display =
            currentAuthorTerm !== "" ? "block" : "none";
      });

      if (clearAuthorBtn) {
        clearAuthorBtn.addEventListener("click", () => {
          authorSearch.value = "";
          currentAuthorTerm = "";
          currentPage = 1;
          renderFiltered();
          clearAuthorBtn.style.display = "none";
          authorSearch.focus();
        });
      }
    }

    // Поиск по тексту
    if (textSearch) {
      textSearch.addEventListener("input", () => {
        currentTextTerm = textSearch.value.trim();
        currentPage = 1;
        renderFiltered();
        if (clearTextBtn)
          clearTextBtn.style.display =
            currentTextTerm !== "" ? "block" : "none";
      });

      if (clearTextBtn) {
        clearTextBtn.addEventListener("click", () => {
          textSearch.value = "";
          currentTextTerm = "";
          currentPage = 1;
          renderFiltered();
          clearTextBtn.style.display = "none";
          textSearch.focus();
        });
      }
    }

    renderFiltered();
  }

  // ==========================================
  // 10. СТАРАЯ ПАГИНАЦИЯ (ДЛЯ СТРАНИЦ БЕЗ НОВОГО ПОИСКА)
  // ==========================================

  function initSearchAndPagination() {
    const searchInput = document.getElementById("authorSearch");
    if (!searchInput) return;
    const clearBtn = document.getElementById("clearSearch");
    const noResults = document.getElementById("noResults");
    const container = document.getElementById("quotesContainer");
    if (!container) return;
    let allQuotes = Array.from(container.querySelectorAll(".quote-card"));
    let page = 1;
    let searchTerm = "";
    const PER_PAGE = 10;

    function filterQuotes() {
      if (searchTerm === "") return allQuotes;
      return allQuotes.filter((card) => {
        const author = card.getAttribute("data-author")?.toLowerCase() || "";
        return author.includes(searchTerm);
      });
    }

    function render() {
      const filtered = filterQuotes();
      const end = page * PER_PAGE;
      allQuotes.forEach((q) => (q.style.display = "none"));
      filtered.forEach((q, i) => {
        if (i < end) q.style.display = "";
      });
      if (noResults)
        noResults.style.display =
          filtered.length === 0 && searchTerm !== "" ? "block" : "none";
      const oldBtn = container.querySelector(".show-more-btn");
      if (oldBtn) oldBtn.remove();
      if (page * PER_PAGE < filtered.length && filtered.length > PER_PAGE) {
        const btn = document.createElement("button");
        btn.className = "show-more-btn";
        btn.textContent = "Показать больше";
        btn.onclick = () => {
          page++;
          render();
        };
        container.appendChild(btn);
      }
      if (clearBtn)
        clearBtn.style.display = searchTerm !== "" ? "block" : "none";
      initHearts();
      addCopyButtons();
    }

    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value.toLowerCase().trim();
      page = 1;
      render();
    });
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchTerm = "";
        page = 1;
        render();
        searchInput.focus();
      });
    }
    render();
  }

  // ==========================================
  // 11. СКРОЛЛ НАВЕРХ
  // ==========================================

  function initScrollToTop() {
    const btn = document.getElementById("scrollToTop");
    if (!btn) return;
    const isHomePage =
      window.location.pathname === "/" ||
      window.location.pathname.endsWith("index.html");
    if (isHomePage) {
      btn.style.display = "none";
      return;
    }
    window.addEventListener("scroll", () =>
      btn.classList.toggle("show", window.pageYOffset > 300),
    );
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }

  // ==========================================
  // 12. ДИНАМИЧЕСКОЕ МЕНЮ (БУРГЕР)
  // ==========================================

  function initDynamicMenu() {
    const isLoggedIn = window.isAuthenticated();
    const profileLink = document.getElementById("profileLink");
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");

    if (profileLink && loginLink && logoutLink) {
      if (isLoggedIn) {
        profileLink.style.display = "block";
        loginLink.style.display = "none";
        logoutLink.style.display = "block";
        const logoutBtn = document.getElementById("logoutNavBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (confirm("Вы уверены, что хотите выйти?")) window.logoutUser();
          });
        }
      } else {
        profileLink.style.display = "block";
        loginLink.style.display = "block";
        logoutLink.style.display = "none";
      }
    }
  }

  // ==========================================
  // 13. КАРУСЕЛЬ "ЖИЗНЬ ЦЕНТРА" (Swiper)
  // ==========================================

  function initLifeCarousel() {
    if (
      typeof Swiper !== "undefined" &&
      document.querySelector(".life-swiper")
    ) {
      new Swiper(".life-swiper", {
        loop: true,
        autoplay: { delay: 4000, disableOnInteraction: false },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        pagination: { el: ".swiper-pagination", clickable: true },
        speed: 800,
        slidesPerView: 1,
      });
    }
  }

  // ==========================================
  // 14. ЗАПУСК ВСЕГО ПРИ ЗАГРУЗКЕ
  // ==========================================

  document.addEventListener("DOMContentLoaded", () => {
    initQuotesStorage();
    initScrollToTop();
    initDefaultUser();

    // Поиск и пагинация
    if (document.getElementById("quotesContainer")) {
      if (document.getElementById("textSearch")) {
        initAdvancedSearch();
      } else {
        initSearchAndPagination();
      }
    }

    initRegisterForm();
    initLoginForm();
    initProfileForm();
    displaySavedQuotes();
    initHearts();
    initSuggestForm();
    if (document.getElementById("suggestedList")) initAdminPanel();
    addLogoutButton();
    initDynamicMenu();
    addCopyButtons();
    initLifeCarousel();
  });
})();
