document.addEventListener("DOMContentLoaded", function () {
  const menuIcon = document.getElementById("menu-icon");
  const dropdown = document.getElementById("dropdown-menu");

  if (menuIcon && dropdown) {
    menuIcon.addEventListener("click", function () {
      dropdown.classList.toggle("active");
    });
  }
});
