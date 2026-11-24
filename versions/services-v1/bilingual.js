/* Keep explicit language selection on the same page and section. */
(() => {
  const english = document.documentElement.lang === 'en';
  document.querySelectorAll('[data-language-target]').forEach(link => {
    const base = link.getAttribute('href').split('#')[0];
    const sync = () => { link.href = base + window.location.hash; };
    sync(); window.addEventListener('hashchange', sync);
  });
  if (!english) return;
  // Existing image viewers create their interface only when opened.
  const phrases = new Map([
    ['展开菜单','Open menu'],['收起菜单','Close menu'],['放大图片','Enlarged image'],
    ['图片预览','Image preview'],['关闭图片预览','Close image preview'],
    ['上一张图片','Previous image'],['下一张图片','Next image'],
    ['正在加载图片…','Loading image…'],
    ['图片暂时无法加载，可以切换其他图片或关闭后重试。','Image could not load. Select another image or close and retry.']
  ]);
  const patch = root => {
    if (root.nodeType === Node.TEXT_NODE) {
      const value=phrases.get(root.textContent.trim());
      if(value) root.textContent=value;
      return;
    }
    if(root.nodeType !== Node.ELEMENT_NODE) return;
    for(const attr of ['aria-label','alt']) {
      const value=phrases.get(root.getAttribute(attr)); if(value) root.setAttribute(attr,value);
    }
    root.childNodes.forEach(patch);
  };
  new MutationObserver(records => records.forEach(record => {
    if(record.type==='characterData') patch(record.target);
    else if(record.type==='attributes') patch(record.target);
    else record.addedNodes.forEach(patch);
  })).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','alt']});
})();
