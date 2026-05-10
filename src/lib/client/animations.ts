export function popElement(el: HTMLElement) {
  el.style.transform = 'scale(1.18)';
  el.style.opacity = '0.7';
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      el.style.transform = 'scale(1)';
      el.style.opacity = '1';
    })
  );
}
