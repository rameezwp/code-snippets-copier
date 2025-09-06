=== Code Snippets Copier ===
Contributors: webcodingplace
Donate link: https://webcodingplace.com
Tags: shortcode, copy, clipboard, snippets, utilities
Requires at least: 5.0
Tested up to: 6.6
Requires PHP: 7.4
Stable tag: 1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Easily create and copy shortcode/code snippets to the clipboard via AJAX with one click. Store snippets in a custom post type and insert copy buttons anywhere.

== Description ==

**Code Snippets Copier** allows site admins to create reusable code or shortcode snippets in a custom post type, and let visitors copy them with a single click.  
No more escaping quotes or manually pasting — snippets are stored safely in the editor and copied raw via AJAX.

### ✨ Features
- Custom Post Type **"Code Snippets"** with title + content (where you add your code/shortcode).
- Frontend copy buttons using AJAX (no rendering, just raw snippet text).
- Shortcode helper `[wcp_code_copy_btn id="123" label="Copy Code"]`.
- Supports multiple buttons on a single page.
- Secure: only published snippets are publicly available, drafts are restricted.
- Clipboard API with fallback for older browsers.

### 🎯 Use cases
- Share **shortcodes** for WPBakery/Elementor demos.
- Provide **code samples** in tutorials or documentation.
- Distribute **reusable snippets** to your clients/users.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/code-snippets-copier/` or install via WordPress Admin → Plugins → Add New.
2. Activate the plugin.
3. Go to **Code Snippets** in the WordPress admin menu, click **Add New**, and paste your code/shortcode into the editor.
4. Publish the snippet.
5. Insert a copy button anywhere using:

Shortcode: [wcp_code_copy_btn id="123" label="Copy Code"]

== Frequently Asked Questions ==

= How do I find the snippet ID? =
Edit your snippet in the admin and look at the URL:
post=123 → the ID is 123.

= Does it execute shortcodes or code? =
No. It returns the raw content exactly as you entered, so users can copy/paste it.

= Does it work on HTTP sites? =
Yes, but on insecure sites the modern navigator.clipboard API may not be available. The plugin falls back to execCommand('copy') and finally a manual prompt.

= Can I style the buttons? =
Yes, the output is a simple <button> with class sc-copy-btn. Style it with CSS or add extra classes via shortcode:
[wcp_code_copy_btn id="123" class="btn btn-primary"]
