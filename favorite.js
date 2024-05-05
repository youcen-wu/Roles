const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users";
const SHOW_URL = INDEX_URL + "/:id";
const dataPanel = document.querySelector("#data-panel");
const users = JSON.parse(localStorage.getItem("favoriteUsers")) || [];
const searchFrom = document.querySelector("#search-form");

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
          <p class="card-text text-center card-title">${user.name}&nbsp;&nbsp;<i class="fa-solid fa-person" style="${colorStyle};"></i>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <i class="fa-solid fa-trash-can remove-favorite" data-id="${user.id}" title="移除名單"></i></p>
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

// 3.移除收藏清單
function removeToFavorite(id) {

  // 如果收藏清單沒有內容，可以跳一個alert('沒有收藏清單')
  if (!users || !users.length) return;

  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) return;

  users.splice(userIndex, 1);

  // 將資料存進localStorage，務必字串化
  localStorage.setItem("favoriteUsers", JSON.stringify(users));
  renderUserList(users);

  // 確保完全刪除後再彈出alert
  setTimeout(() => {
    if (users.length === 0) {
      alert("沒有收藏清單");
    }
  }, 0);
}

dataPanel.addEventListener("click", (e) => {
  if (e.target.matches(".card-img-top")) {
    showUserModal(Number(e.target.dataset.id));
  } else if (e.target.matches(".fa-trash-can")) {
    removeToFavorite(Number(e.target.dataset.id));
  }
});

renderUserList(users);
