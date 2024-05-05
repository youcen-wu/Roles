const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";
const SHOW_URL = INDEX_URL + "/:id";
const dataPanel = document.querySelector("#data-panel");
const users = []; // 所有使用者
let filterUsers = [];
const searchFrom = document.querySelector("#search-form");
const USER_PAGE = 20; // 設定每頁顯示 ? 筆資料
const paginator = document.querySelector("#paginator"); // 分頁器




// ----

// 檢查 localStorage 中是否已經有主題偏好設置，如果沒有就使用默認的主題
const theme = localStorage.getItem('theme');
if (theme) {
  document.body.classList.add(theme);
} else {
  document.body.classList.add('light-mode');
}

// 點擊切換主題按鈕時執行切換主題功能
const themeToggleBtn = document.querySelector("#flexSwitchCheckDefault");
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');

  // 保存使用者的主題偏好設置
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
  localStorage.setItem('theme', currentTheme);
});

// ---


// 1.先渲染使用者清單
function renderUserList(users) {
  let rawHTML = "";

  users.forEach((user) => {
    // 透過變數更改icon對於不同性別的顏色
    const colorStyle = user.gender === "male" ? "color: blue;" : "color: pink;";

    // 排除顯示null的名單
    if (user.avatar !== null) {
      rawHTML += `
      <div class="col-sm-3 mb-3 justify-content-center d-flex">
        <div class="card" style="width: 18rem;">
          <img src="${user.avatar}" class="card-img-top" title="查看更多資訊" alt="avatar" data-bs-toggle="modal" data-bs-target="#exampleModal" data-id="${user.id}">
          <div class="card-body">
          <p class="card-text text-center card-title">${user.name}&nbsp;&nbsp;<i class="fa-solid fa-person" style="${colorStyle};"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <i class="fa-regular fa-heart add-favorite" data-id="${user.id}" title="加入收藏名單"></i></p>
          </div>
        </div>
      </div> 
      `;
    }
  });
  dataPanel.innerHTML = rawHTML;
}

// 2.渲染使用者Modal
function showUserModal(id) {
  // get element
  const titleModal = document.querySelector("#exampleModalLabel");
  const imgModal = document.querySelector("#img-madol");
  const emailModal = document.querySelector("#emailModal");
  const genderModal = document.querySelector("#genderModal");
  const ageModal = document.querySelector("#ageModal");
  const regionModal = document.querySelector("#regionModal");
  const birthdayModal = document.querySelector("#birthdayModal");

  axios.get(INDEX_URL + "/" + id).then((Response) => {
    const data = Response.data;
    titleModal.innerText = data.name + " " + data.surname;
    imgModal.innerHTML = `<img src="${data.avatar}">`;
    emailModal.innerText = "Email : " + data.email;
    genderModal.innerText = "Gender : " + data.gender;
    ageModal.innerText = "Age : " + data.age;
    regionModal.innerText = "Region : " + data.region;
    birthdayModal.innerText = "Birthday : " + data.birthday;
  });
}

// 3.做出搜尋功能
searchFrom.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.querySelector("#search-input");
  let keyword = input.value.trim().toLowerCase();

  // 如果keyword是空字串，就直接alert
  if (!keyword.length) {
    alert("請輸入有效的關鍵字");
  }
  filterUsers = users.filter((user) =>
    (user.name + user.surname).toLowerCase().includes(keyword)
  );

  // 沒有符合條件的結果
  if (filterUsers.length === 0) {
    alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filterUsers.length);
  //預設顯示第 1 頁的搜尋結果
  renderUserList(getUserByPage(1));
});

// 4.做出收藏名單
function addToFavorite(id) {
  // 務必要加上JSON.parse轉換格式
  const list = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
  const user = users.find((user) => user.id === id);

  // 重複加入處理
  if (list.some((user) => user.id === id)) {
    alert("已在收藏清單中");
    return;
  }

  // 將資料存進localStorage，務必字串化
  list.push(user);
  localStorage.setItem("favoriteUsers", JSON.stringify(list));
}

// 5-1.做出分頁功能
// 5-2.從總清單切割資料，並在分頁器掛上監聽器
// 5-3.到axios改變renderUserList(getUserByPage(1)) 參數可以是函式
function getUserByPage(page) {
  // 計算起始users index
  // 0-11, 12-23, 24-35, ...
  const data = filterUsers.length? filterUsers : users;
  const starIndex = (page - 1) * USER_PAGE;
  return data.slice(starIndex, starIndex + USER_PAGE);
}

// 6.渲染分頁
function renderPaginator(amount) {
  // 計算總頁數
  const numberOfPages = Math.ceil(amount / USER_PAGE);
  // 製作template
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link mt-3" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

// 7.Pagination 事件監聽器
paginator.addEventListener("click", (e) => {
  //如果被點擊的不是 a 標籤就結束
  if (e.target.tagName !== "A") return;
  const page = Number(e.target.dataset.page);
  renderUserList(getUserByPage(page));
});



dataPanel.addEventListener("click", (e) => {
  if (e.target.matches(".card-img-top")) {
    showUserModal(Number(e.target.dataset.id));
  } else if (e.target.matches(".add-favorite")) {
    addToFavorite(Number(e.target.dataset.id));
    e.target.classList.toggle("fa-solid");
  }
});

axios
  .get(INDEX_URL)
  .then((Response) => {
    users.push(...Response.data.results);
    renderPaginator(users.length);
    renderUserList(getUserByPage(1));
  })
  .catch((e) => {
    console.log(e);
  });
