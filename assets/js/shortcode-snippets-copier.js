(function () {
    // Delegated click handler for any element with data-shortcode-id or .sc-copy-btn
    document.addEventListener('click', function (ev) {
        var btn = ev.target.closest('[data-shortcode-id], .sc-copy-btn');
        if (!btn) {
            return;
        }
        ev.preventDefault();

        var id = btn.getAttribute('data-shortcode-id');
        if (!id) {
            return;
        }

        // Prepare AJAX call (FormData ensures compatibility)
        var form = new FormData();
        form.append('action', 'ssc_get_snippet');
        form.append('id', id);
        form.append('nonce', (typeof ssc_vars !== 'undefined' && ssc_vars.nonce) ? ssc_vars.nonce : '');

        fetch((typeof ssc_vars !== 'undefined' ? ssc_vars.ajax_url : '/wp-admin/admin-ajax.php'), {
            method: 'POST',
            credentials: 'same-origin',
            body: form
        }).then(function (res) {
            return res.json();
        }).then(function (json) {
            if (!json || !json.success) {
                var msg = (typeof ssc_vars !== 'undefined' && ssc_vars.i18n && ssc_vars.i18n.failed) ? ssc_vars.i18n.failed : 'Failed to copy';
                alert(msg);
                return;
            }

            // JSON success structure: { success: true, data: { shortcode: "..." } }
            var shortcode = '';
            if (json.data && json.data.shortcode) {
                shortcode = json.data.shortcode;
            } else if (json.shortcode) {
                shortcode = json.shortcode;
            } else {
                alert((ssc_vars && ssc_vars.i18n && ssc_vars.i18n.failed) ? ssc_vars.i18n.failed : 'Failed to copy');
                return;
            }

            // Copy to clipboard (modern API preferred)
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(shortcode).then(function () {
                    var okMsg = (ssc_vars && ssc_vars.i18n && ssc_vars.i18n.copied) ? ssc_vars.i18n.copied : 'Copied';
                    alert(okMsg);
                }).catch(function () {
                    fallbackCopy(shortcode);
                });
            } else {
                fallbackCopy(shortcode);
            }
        }).catch(function (err) {
            console.error(err);
            alert((ssc_vars && ssc_vars.i18n && ssc_vars.i18n.failed) ? ssc_vars.i18n.failed : 'Failed to copy');
        });
    }, false);

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        // move off-screen
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();

        try {
            var ok = document.execCommand('copy');
            document.body.removeChild(ta);
            if (ok) {
                alert((ssc_vars && ssc_vars.i18n && ssc_vars.i18n.copied) ? ssc_vars.i18n.copied : 'Copied');
                return;
            }
        } catch (e) {
            // ignore
        }

        document.body.removeChild(ta);
        // last resort - show a prompt so user can copy manually
        window.prompt('Copy the shortcode below (Ctrl/Cmd+C, Enter):', text);
    }
})();
