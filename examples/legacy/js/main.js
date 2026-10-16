// examples/legacy — Sprint 0 占位脚本。待迁移原型逻辑。
// 原型入口：读取 window.__PINS__ 并渲染到 #globe。
(function () {
  const el = document.getElementById('globe');
  if (el) {
    el.textContent = 'legacy prototype placeholder';
  }
})();
