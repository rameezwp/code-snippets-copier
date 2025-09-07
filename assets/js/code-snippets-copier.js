(function () {
    // Delegated click handler
    document.addEventListener('click', function (ev) {
        var btn = ev.target.closest('[data-codecopy-id], [class*="data-codecopy-id-"], .wcp-code-copy-btn');
        if (!btn) return;
        ev.preventDefault();

        // 1. Standard way (data-codecopy-id)
        var id = btn.getAttribute('data-codecopy-id');

        // 2. Alternative way (class="data-codecopy-id-123")
        if (!id || id == 0) {
            var classList = btn.className.split(/\s+/);
            console.log(classList);
            classList.forEach(function (cls) {
                if (cls.indexOf('data-codecopy-id-') === 0) {
                    id = cls.replace('data-codecopy-id-', '');
                }
            });
        }

        
        if (!id) return;

        var form = new FormData();
        form.append('action', 'wcpcsc_get_snippet');
        form.append('id', id);
        form.append('nonce', (typeof wcpcsc_vars !== 'undefined' && wcpcsc_vars.nonce) ? wcpcsc_vars.nonce : '');

        fetch((typeof wcpcsc_vars !== 'undefined' ? wcpcsc_vars.ajax_url : '/wp-admin/admin-ajax.php'), {
            method: 'POST',
            credentials: 'same-origin',
            body: form
        })
        .then(res => res.json())
        .then(json => {
            if (!json || !json.success) {
                showTooltip(btn, (wcpcsc_vars?.i18n?.failed) || 'Failed');
                return;
            }

            var shortcode = json.data?.shortcode || json.shortcode || '';
            if (!shortcode) {
                showTooltip(btn, (wcpcsc_vars?.i18n?.failed) || 'Failed');
                return;
            }

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(shortcode)
                    .then(() => showTooltip(btn, (wcpcsc_vars?.i18n?.copied) || 'Copied'))
                    .catch(() => fallbackCopy(shortcode, btn));
            } else {
                fallbackCopy(shortcode, btn);
            }
        })
        .catch(err => {
            console.error(err);
            showTooltip(btn, (wcpcsc_vars?.i18n?.failed) || 'Failed');
        });
    }, false);

    function fallbackCopy(text, btn) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();

        try {
            var ok = document.execCommand('copy');
            document.body.removeChild(ta);
            if (ok) {
                showTooltip(btn, (wcpcsc_vars?.i18n?.copied) || 'Copied');
                return;
            }
        } catch (e) {}
        document.body.removeChild(ta);
        window.prompt('Copy the shortcode below (Ctrl/Cmd+C, Enter):', text);
    }

    // Tooltip function
    function showTooltip(btn, text) {
        var tip = document.createElement('div');
        tip.textContent = text;
        tip.className = 'wcp-tooltip';
        document.body.appendChild(tip);

        // Position above the button
        var rect = btn.getBoundingClientRect();
        tip.style.position = 'absolute';
        tip.style.left = (rect.left + window.scrollX + rect.width / 2 - tip.offsetWidth / 2) + 'px';
        tip.style.top = (rect.top + window.scrollY - 30) + 'px';

        setTimeout(() => {
            tip.classList.add('fadeout');
            setTimeout(() => tip.remove(), 300);
        }, 1000);
    }
})();
