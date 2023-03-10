let toggle = document.querySelector(".toggle");
let close = document.querySelector(".close");
let navSwitch = document.querySelector(".nav-switch");

toggle.onclick = () => {
  navSwitch.classList.add("open");
};
close.onclick = () => {
  navSwitch.classList.remove("open");
};
document.onkeyup = (e) => {
  if (e.key == "Escape") {
    navSwitch.classList.remove("open");
  }
};
