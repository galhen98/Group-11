document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Helpers (LocalStorage + UI utilities)
  // =========================

  // Read users array from localStorage (or return empty array)
  function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
  }

  // Persist users array to localStorage
  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Save a simple session flag + current user identifier
  function setSession(email) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUserEmail", email);
  }

  // Set text message inside an error placeholder element (if exists)
  function setError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg || "";
  }

  // Clear login error placeholders
  function clearLoginErrors() {
    setError("login-email-error", "");
    setError("login-password-error", "");
  }

  // Trigger a small "shake" animation on failed login attempts
  // (requires: .auth-card element + .shake animation in global.css)
  function triggerLoginFailAnimation() {
    const card = document.querySelector(".auth-card");
    if (!card) return;

    // Remove and re-add the class so the animation can replay
    card.classList.remove("shake");
    void card.offsetWidth; // force reflow
    card.classList.add("shake");

    // Cleanup after animation ends
    card.addEventListener(
      "animationend",
      () => card.classList.remove("shake"),
      { once: true }
    );
  }

  // =========================
  // SIGNUP
  // =========================
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Read the email field and check for duplicates
      const email = document.getElementById("signup-email")?.value.trim() || "";
      const users = getUsers();

      // Block registration if email already exists
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        alert("This email is already registered.");
        return;
      }

      // Build user object from form inputs
      const userData = {
        fullName: document.getElementById("signup-name")?.value.trim(),
        email,
        phone: document.getElementById("signup-phone")?.value.trim(),
        city: document.getElementById("signup-city")?.value.trim(),
        password: document.getElementById("signup-password")?.value
      };

      // Save user + create session, then redirect to My Account
      users.push(userData);
      saveUsers(users);
      setSession(email);
      window.location.href = "myaccount.html";
    });
  }

  // =========================
  // LOGIN (validation + friendly messages + animation)
  // =========================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearLoginErrors();

      // Read credentials from inputs
      const email = document.getElementById("login-email")?.value.trim() || "";
      const password = document.getElementById("login-password")?.value || "";

      const users = getUsers();

      // Find user by email (case-insensitive)
      const userByEmail = users.find(
        (u) => (u.email || "").toLowerCase() === email.toLowerCase()
      );

      // No user found with this email
      if (!userByEmail) {
        setError(
          "login-email-error",
          "No account found for this email. Please sign up first."
        );
        triggerLoginFailAnimation();
        return;
      }

      // Wrong password
      if (userByEmail.password !== password) {
        setError("login-password-error", "Incorrect password. Please try again.");
        triggerLoginFailAnimation();
        return;
      }

      // Success: set session and redirect
      setSession(userByEmail.email);
      window.location.href = "myaccount.html";
    });
  }

  // =========================
  // BOOKING & COMPANION SELECTION
  // =========================

  // Simple "database" of companion candidates (mock data)
  const companionsDatabase = [
    { name: "Noa", age: 24, bio: "Loves live music.", rating: 4.5, icon: "bi-person-heart" },
    { name: "Maya", age: 29, bio: "Sophisticated gala dinners.", rating: 4.8, icon: "bi-person-stars" },
    { name: "Tom", age: 31, bio: "Networking expert.", rating: 4.9, icon: "bi-person-check" },
    { name: "Adi", age: 35, bio: "Calm and intellectual.", rating: 4.7, icon: "bi-person-workspace" },
    { name: "Daniel", age: 42, bio: "Formal events expert.", rating: 5.0, icon: "bi-person-badge" },
    { name: "Elena", age: 52, bio: "High-end gala companion.", rating: 4.9, icon: "bi-person-check-circle" }
  ];

  // After results are rendered dynamically, attach click listeners to selection buttons
  function attachSelectionListeners() {
    document.querySelectorAll(".companion-select-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        // Get the selected companion name from data attribute
        const name = this.getAttribute("data-name") || "Unknown";

        // Read event date from form (used to mark booking as Upcoming/Completed)
        const eventDateValue = document.getElementById("eventDate")?.value;

        // Compare selected date to "today"
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(eventDateValue);

        // Create a new booking object
        const newBooking = {
          companion: name,
          event: document.getElementById("eventType")?.value || "Special Event",
          date: eventDateValue || "TBD",
          location: document.getElementById("eventLocation")?.value || "Israel",
          status: selectedDate >= today ? "Upcoming" : "Completed"
        };

        // Save booking history + latest booking in localStorage
        let history = JSON.parse(localStorage.getItem("bookingsHistory") || "[]");
        history.push(newBooking);
        localStorage.setItem("bookingsHistory", JSON.stringify(history));
        localStorage.setItem("latestBooking", JSON.stringify(newBooking));

        // Redirect to My Account to display the booking
        window.location.href = "myaccount.html";
      });
    });
  }

  // =========================
// BOOKING: Date picker (disable past dates + prevent typing)
// =========================
const eventDateInput = document.getElementById("eventDate");
const eventDateError = document.getElementById("eventDate-error");

if (eventDateInput) {
  // Set min date to today (local time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  eventDateInput.min = todayStr;

  // Prevent manual typing but keep calendar picker working
  eventDateInput.addEventListener("keydown", (e) => e.preventDefault());

  // Extra validation (paste / browser edge cases)
  eventDateInput.addEventListener("input", () => {
    const v = eventDateInput.value;
    if (!v) {
      if (eventDateError) eventDateError.textContent = "";
      return;
    }
    if (v < eventDateInput.min) {
      if (eventDateError) eventDateError.textContent = "Please choose a future date.";
      eventDateInput.value = "";
      return;
    }
    if (eventDateError) eventDateError.textContent = "";
  });
}

  // Booking form submit: generate "matches" and render results
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Parse the first number found in the selected age range (e.g., "25-32")
      const ageRaw = document.getElementById("ageRange")?.value || "";
      const selectedAge = parseInt(ageRaw.match(/\d+/)?.[0] || "", 10);

      const resultsSection = document.getElementById("companionResults");
      const resultsGrid = resultsSection?.querySelector(".row");

      if (resultsGrid) {
        // Filter matches by ±7 years around selected age, and return top 2 results
        const matches = companionsDatabase
          .filter(c => !selectedAge || (c.age >= selectedAge - 7 && c.age <= selectedAge + 7))
          .slice(0, 2);

        // Render match cards (Bootstrap grid + custom styles)
        resultsGrid.innerHTML = matches.map(companion => `
          <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm p-4 text-center h-100" style="border-radius: 22px;">
              <i class="bi ${companion.icon} text-primary fs-1 mb-3"></i>
              <h3 class="fw-bold h4">${companion.name}, ${companion.age}</h3>
              <p class="text-muted small">${companion.bio}</p>
              <button class="header-pill-btn border-0 w-100 companion-select-btn py-2"
                      data-name="${companion.name}" style="background:#7A5CFF; color:white; border-radius: 50px;">
                Select ${companion.name}
              </button>
            </div>
          </div>`).join('') || '<p class="text-center">No matches found.</p>';

        // Hide the form and show results
        bookingForm.classList.add("d-none");
        resultsSection.classList.remove("d-none");

        // Attach listeners after dynamic HTML injection
        attachSelectionListeners();
      }
    });
  }

  // =========================
  // MY ACCOUNT: Populate user + bookings
  // =========================
  // Run only on the myaccount page (simple URL check)
  if (window.location.pathname.toLowerCase().includes("myaccount")) {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const accountContent = document.getElementById("account-content");
    const notLoggedIn = document.getElementById("not-logged-in");

    // Toggle view based on login state
    if (!isLoggedIn) {
      if (accountContent) accountContent.classList.add("d-none");
      if (notLoggedIn) notLoggedIn.classList.remove("d-none");
      return;
    } else {
      if (accountContent) accountContent.classList.remove("d-none");
      if (notLoggedIn) notLoggedIn.classList.add("d-none");
    }

    // Load current user profile data
    const currentEmail = localStorage.getItem("currentUserEmail") || "";
    const user = getUsers().find((u) => u.email === currentEmail);

    if (user) {
      document.getElementById("display-name").textContent = user.fullName;
      document.getElementById("display-email").textContent = user.email;
      document.getElementById("display-phone").textContent = user.phone;
      document.getElementById("display-city").textContent = user.city;
    }

    // Populate booking history table
    const pastBookingsList = document.getElementById("past-bookings-list");
    if (pastBookingsList) {
      const history = JSON.parse(localStorage.getItem("bookingsHistory") || "[]");

      // Empty state
      if (history.length === 0) {
        pastBookingsList.innerHTML = `<tr><td colspan="4" class="text-center py-4">No bookings found.</td></tr>`;
      } else {
        // Show newest bookings first
        pastBookingsList.innerHTML = [...history].reverse().map(item => {
          const currentStatus = item.status || "Completed";
          const isUpcoming = currentStatus === "Upcoming";

          // Badge color (Bootstrap utilities)
          const badgeClass = isUpcoming ? "bg-primary text-primary" : "bg-success text-success";

          return `
            <tr>
              <td class="fw-semibold">${item.event}</td>
              <td>${item.location}</td>
              <td>${item.companion}</td>
              <td><span class="badge rounded-pill ${badgeClass} bg-opacity-10">${currentStatus}</span></td>
            </tr>`;
        }).join('');
      }
    }

    // Show the latest booking summary in the "Active Booking" area (if exists)
    const booking = JSON.parse(localStorage.getItem("latestBooking") || "null");
    const statusArea = document.getElementById("booking-status-area");
    if (booking && statusArea) {
      statusArea.innerHTML = `
        <div class="p-3 border rounded-4 shadow-sm bg-white text-start">
          <h6 class="fw-bold" style="color:#7A5CFF;">Latest Booking Made</h6>
          <p class="mb-1"><b>Companion:</b> ${booking.companion}</p>
          <p class="mb-1"><b>Event:</b> ${booking.event}</p>
          <p class="mb-0 small text-muted"><b>Date:</b> ${booking.date}</p>
        </div>`;
    }
  }
// =========================
  // SECURITY & NAVIGATION GUARDS
  // =========================
  
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // 1. הגנה על דף ה-Booking (חסימת גישה ישירה)
  if (window.location.pathname.includes("booking.html") && !isLoggedIn) {
      alert("Access Denied. Please log in first.");
      window.location.href = "myaccount.html";
  }

  // 2. הגנה על כפתור ה-Booking בעמוד הבית
  const bookingBtn = document.getElementById("hero-booking-link");
  if (bookingBtn) {
      bookingBtn.addEventListener("click", (e) => {
          if (!isLoggedIn) {
              e.preventDefault(); 
              alert("You must log in before booking an elite plus-one!");
              window.location.href = "myaccount.html"; 
          }
      });
  }
});


// Global logout handler (called from buttons in the UI)
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUserEmail");
  window.location.href = "index.html";
}
