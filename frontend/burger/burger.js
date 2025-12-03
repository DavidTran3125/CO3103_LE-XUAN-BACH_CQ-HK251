class BurgerSidebar extends HTMLElement {
  connectedCallback() {
    // Lấy thông tin từ localStorage
    const firstName = localStorage.getItem('user_first_name') || 'Người dùng';
    const email = localStorage.getItem('user_email') || 'Chưa có email';

    this.innerHTML = `
      <div class="burger-icon" id="burgerToggle">
        <img src="http://localhost:5500/frontend/asset/burger.svg" alt="Menu" class="burger-img">
      </div>

      <nav class="burger-menu active" id="burgerMenu">
        <div class="top-bar">
          <img src="http://localhost:5500/frontend/asset/wp2p.png" alt="Logo" class="logo">
        </div>

        <div class="profile-card2">
          <img src="http://localhost:5500/frontend/asset/avatar.svg" alt="Avatar" class="avatar">
          <div class="profile-info">
            <p class="greeting">Xin chào, ${firstName}</p>
            <p class="email">${email}</p>
          </div>
        </div>

        <ul>
          <li class="block"><a href="http://localhost:5500/frontend/home/home.html" class="menu-link"><img src="http://localhost:5500/frontend/asset/home.png" class="icon"> Trang chủ</a></li>
          <li class="block"><a href="http://localhost:5500/frontend/profile/profile.html" class="menu-link"><img src="http://localhost:5500/frontend/asset/profile.svg" class="icon"> Hồ sơ cá nhân</a></li>
          <li class="block"><a href="http://localhost:5500/frontend/search/search.html" class="menu-link"><img src="http://localhost:5500/frontend/asset/search.svg" class="icon"> Tìm kiếm</a></li>
          <li class="block"><a href="http://localhost:5500/frontend/friendrequest/friendrequest.html" class="menu-link"><img src="http://localhost:5500/frontend/asset/his_learn.svg" class="icon"> Danh sách yêu cầu</a></li>
          <li class="block"><a href="http://localhost:5500/frontend/group/group.html" class="menu-link"><img src="http://localhost:5500/frontend/asset/group.svg" class="icon"> Group</a></li>
          <li class="block"><a href="http://localhost:5500/frontend/chat/chat.html" class="menu-link"><img src="http://localhost:5500/frontend/asset/chat.svg" class="icon"> Chat</a></li>
          <li class="block logout-btn"><img src="http://localhost:5500/frontend/asset/logout.svg" class="icon"> Đăng xuất</li>
        </ul>
      </nav>
    `;

    // Gắn sự kiện đăng xuất
    this.querySelector('.logout-btn').addEventListener('click', async () => {
      try {
        await fetch('http://localhost:3000/api/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (err) {
        console.warn('Không gọi được API logout:', err);
      }
      localStorage.clear();
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      window.location.href = "http://localhost:5500/frontend/login/login.html";
    });
  }
}

customElements.define('burger-sidebar', BurgerSidebar);