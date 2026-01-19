// ✅ Scroll Effect on Header
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (header) { // make sure header exists
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
});