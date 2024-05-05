const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";
const SHOW_URL = INDEX_URL + "/:id";
const dataPanel = document.querySelector("#data-panel");
const paginator = document.querySelector("#paginator");
const searchForm = document.querySelector("#search-form");
const users = []; // 所有使用者
const favoriteUsers = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
const USER_PAGE = 20;

// 檢查 localStorage 中是否已經有主題偏好設置，如果沒有就使用默認的主題
const theme = localStorage.getItem("theme");
if (theme) {
  document.body.classList.add(theme);
} else {
  document.body.classList.add("light-mode");
}

// 點擊切換主題按鈕時執行切換主題功能
const themeToggleBtn = document.querySelector("#flexSwitchCheckDefault");
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");

  // 保存使用者的主題偏好設置
  const currentTheme = document.body.classList.contains("dark-mode")
    ? "dark-mode"
    : "light-mode";
  localStorage.setItem("theme", currentTheme);
});

// 渲染使用者清單
function renderUserList(users) {
  let rawHTML = "";
  users.forEach((user) => {
    const colorStyle = user.gender === "male" ? "color: blue;" : "color: pink;";
    rawHTML += `
      <div class="col-sm-3 mb-3 justify-content-center d-flex">
        <div class="card" style="width: 18rem;">
          <img src="${
            user.avatar
          }" class="card-img-top" title="查看更多資訊" alt="avatar" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${
      user.id
    }">
          <div class="card-body">
            <p class="card-text text-center card-title">${
              user.name
            }&nbsp;&nbsp;<i class="fa-solid fa-person" style="${colorStyle};"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <i class="fa-solid fa-${
              isFavorite(user.id) ? "heart" : "heart-empty"
            } add-favorite" data-id="${user.id}" title="${
      isFavorite(user.id) ? "移除收藏" : "加入收藏"
    }"></i></p>
          </div>
        </div>
      </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

// 顯示使用者詳細資訊
function showUserModal(id) {
  const url = `${INDEX_URL}/${id}`;
  axios.get(url).then((response) => {
    const user = response.data;
    const modalTitle = document.querySelector("#exampleModalLabel");
    const modalBody = document.querySelector(".modal-body");
    modalTitle.innerText = `${user.name} ${user.surname}`;
    modalBody.innerHTML = `
      <div class="col-sm-6" id="img-madol">
        <img src="${user.avatar}" alt="avatar" />
      </div>
      <div class="col-sm-6">
        <p>Email: ${user.email}</p>
        <p>Gender: ${user.gender}</p>
        <p>Age: ${user.age}</p>
        <p>Region: ${user.region}</p>
        <p>Birthday: ${user.birthday}</p>
      </div>`;
  });
}

// 加入或移除收藏
function toggleFavorite(id) {
  const index = favoriteUsers.findIndex((user) => user.id === id);
  if (index === -1) {
    const user = users.find((user) => user.id === id);
    if (user) {
      favoriteUsers.push(user);
      localStorage.setItem("favoriteUsers", JSON.stringify(favoriteUsers));
    }
  } else {
    favoriteUsers.splice(index, 1);
    localStorage.setItem("favoriteUsers", JSON.stringify(favoriteUsers));
  }
}

// 檢查使用者是否在收藏清單中
function isFavorite(id) {
  return favoriteUsers.some((user) => user.id === id);
}

// 顯示收藏清單
function renderFavoriteList() {
  renderUserList(favoriteUsers);
}

// 搜尋功能
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchForm.querySelector("input").value.trim().toLowerCase();
  let filteredUsers = [];
  if (keyword) {
    filteredUsers = users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.surname.toLowerCase().includes(keyword)
    );
  } else {
    filteredUsers = users;
  }
  renderPaginator(filteredUsers.length);
  renderUserList(getUsersByPage(1, filteredUsers));
});

// 分頁器點擊事件
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  renderUserList(getUsersByPage(page));
});

// 顯示首頁
function renderFirstPage() {
  renderUserList(getUsersByPage(1));
}

// 根據頁碼顯示該頁的使用者
function getUsersByPage(page, data = users) {
  const startIndex = (page - 1) * USER_PAGE;
  return data.slice(startIndex, startIndex + USER_PAGE);
}

// 渲染分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

// 監聽 data panel 的點擊事件
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".card-img-top")) {
    showUserModal(Number(event.target.dataset.id));
  } else if (
    event.target.matches(".fa-heart") ||
    event.target.matches(".fa-heart-empty")
  ) {
    toggleFavorite(Number(event.target.dataset.id));
    renderFavoriteList();
    renderUserList(users);
  }
});

// 初始化
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results);
    renderPaginator(users.length);
    renderFirstPage();
  })
  .catch((err) => console.log(err));
