document.querySelector("nav span.menu").addEventListener("click", () => {
  const nav = document.querySelector("nav");
  const navOpen = document.querySelector("nav span.menu");
  if (nav.classList.contains("show")) {
    nav.classList.remove("show");
    navOpen.style.opacity = 0;
    setTimeout(() => {
      navOpen.innerHTML = "menu";
      navOpen.style.opacity = 1;
    }, 450);
  } else {
    nav.classList.add("show");
    navOpen.style.opacity = 0;
    setTimeout(() => {
      navOpen.innerHTML = "close";
      navOpen.style.opacity = 1;
    }, 450);
  }
});
