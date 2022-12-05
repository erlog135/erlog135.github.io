document.querySelectorAll(".parallax-wrap").forEach(parallaxWrap =>
  parallaxWrap.addEventListener("mousemove", ({ clientX, clientY }) => {
    let rect = parallaxWrap.getBoundingClientRect()
    let x = rect.left;
    let y = rect.top;
    let hw = (rect.right-x)/2;
    let hh = (rect.bottom-y)/2;
    parallaxWrap.style.setProperty("--x", (clientX-x)-hw);
    parallaxWrap.style.setProperty("--y", (clientY-y)-hh);
  }),
);