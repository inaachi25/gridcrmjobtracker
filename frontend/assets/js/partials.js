// Simple partial loader: elements with `data-include="path"` will be replaced
// with fetched HTML. Executes inline scripts found in the fetched content.
(function () {
  function execScripts(container) {
    var scripts = container.querySelectorAll('script');
    scripts.forEach(function (oldScript) {
      var script = document.createElement('script');
      if (oldScript.src) {
        script.src = oldScript.src;
      } else {
        script.textContent = oldScript.textContent;
      }
      // copy attributes
      for (var i = 0; i < oldScript.attributes.length; i++) {
        var attr = oldScript.attributes[i];
        script.setAttribute(attr.name, attr.value);
      }
      oldScript.parentNode.replaceChild(script, oldScript);
    });
  }

  function includeElement(el) {
    var url = el.getAttribute('data-include');
    if (!url) return Promise.resolve();
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + url);
        return res.text();
      })
      .then(function (html) {
        el.innerHTML = html;
        execScripts(el);
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  function includeAll() {
    var els = document.querySelectorAll('[data-include]');
    var promises = Array.prototype.map.call(els, includeElement);
    return Promise.all(promises);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', includeAll);
  } else {
    includeAll();
  }
})();
