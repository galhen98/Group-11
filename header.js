fetch("header.html")
  .then((res) => res.text())
  .then((html) => {
    const placeholder = document.getElementById("header-placeholder");
    if (!placeholder) return;

    placeholder.innerHTML = html;

    const current = window.location.pathname.split("/").pop() || "index.html";

    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // 1) Active link (based on current file name)
    document.querySelectorAll(".nav-menu a").forEach((a) => {
      if (a.getAttribute("href") === current) a.classList.add("active");
    });

    // 2) Nav: replace "Sign Up" with "My Account" when logged in (same spot)
    const navAccount = document.getElementById("nav-account");
    if (navAccount) {
      if (isLoggedIn) {
        navAccount.textContent = "My Account";
        navAccount.href = "myaccount.html";
      } else {
        navAccount.textContent = "Sign Up";
        navAccount.href = "signup.html";
      }
    }

    // 3) Auth button: Sign In / Sign Out
    const btn = document.getElementById("auth-btn");
    if (btn) {
      if (isLoggedIn) {
        btn.textContent = "Sign Out";
        btn.href = "#";

        btn.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("currentUserEmail");
          window.location.href = "index.html";
        });
      } else {
        btn.textContent = "Sign In";
        btn.href = "login.html";
      }
    }

    // 4) Hamburger toggle
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("nav-menu");

    if (toggle && menu) {
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", menu.classList.contains("open"));
      });

      document.addEventListener("click", () => {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });

      menu.addEventListener("click", (e) => e.stopPropagation());
    }

    // 5) Body padding according to header height
    function updateBodyPadding() {
      const header = document.querySelector(".header");
      if (!header) return;
      document.body.style.paddingTop = header.offsetHeight + "px";
    }

    window.addEventListener("load", updateBodyPadding);
    window.addEventListener("resize", updateBodyPadding);
    updateBodyPadding();
  })
  .catch((err) => console.error("Failed to load header:", err));
