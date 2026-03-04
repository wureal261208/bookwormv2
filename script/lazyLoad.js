// Lazy-loading utility for all site images
// Uses IntersectionObserver and a MutationObserver to watch for new images
// Placeholder displayed until the real src is in viewport

(function() {
    const placeholder = '/img/H22-LazyLoad.gif';
    const options = { rootMargin: '0px 0px 200px 0px', threshold: 0.01 };
    let observer;

    function initObserver() {
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(onIntersection, options);
        }
    }

    function onIntersection(entries, obs) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImg(img);
                obs.unobserve(img);
            }
        });
    }

    function loadImg(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
    }

    function prepareImg(img) {
        if (!img.dataset.src) {
            img.dataset.src = img.src || '';
            img.src = placeholder;
        }
        img.classList.add('lazy');
        if (observer) observer.observe(img);
    }

    function init() {
        initObserver();
        const imgs = document.querySelectorAll('img');
        imgs.forEach(prepareImg);

        if ('MutationObserver' in window) {
            const mo = new MutationObserver(mutations => {
                mutations.forEach(m => {
                    m.addedNodes.forEach(node => {
                        if (node.tagName === 'IMG') {
                            prepareImg(node);
                        } else if (node.querySelectorAll) {
                            node.querySelectorAll('img').forEach(prepareImg);
                        }
                    });
                });
            });
            mo.observe(document.body, { childList: true, subtree: true });
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
