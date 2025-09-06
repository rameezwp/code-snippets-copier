<?php
/**
 * Plugin Name: Code Snippets Copier
 * Description: Register a CPT to store raw shortcodes. Provide AJAX + frontend JS to copy snippets by ID to clipboard.
 * Version: 1.0
 * Author: WebCodingPlace
 * Text Domain: shortcode-snippets-copier
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register CPT: wcp_code_snippets
 */
function ssc_register_cpt() {
    $labels = array(
        'name'               => __( 'Code Snippets', 'shortcode-snippets-copier' ),
        'singular_name'      => __( 'Code Snippet', 'shortcode-snippets-copier' ),
        'add_new_item'       => __( 'Add New Code Snippet', 'shortcode-snippets-copier' ),
        'edit_item'          => __( 'Edit Code Snippet', 'shortcode-snippets-copier' ),
        'new_item'           => __( 'New Code Snippet', 'shortcode-snippets-copier' ),
        'view_item'          => __( 'View Code Snippet', 'shortcode-snippets-copier' ),
        'search_items'       => __( 'Search Code Snippets', 'shortcode-snippets-copier' ),
        'not_found'          => __( 'No shortcode snippets found', 'shortcode-snippets-copier' ),
        'not_found_in_trash' => __( 'No shortcode snippets found in Trash', 'shortcode-snippets-copier' ),
        'menu_name'          => __( 'Code Snippets', 'shortcode-snippets-copier' ),
    );

    $args = array(
        'labels'             => $labels,
        'public'             => false,            // not publicly queryable
        'show_ui'            => true,             // show in admin
        'show_in_menu'       => true,
        'capability_type'    => 'post',
        'supports'           => array( 'title', 'editor' ), // title + editor (where you paste raw shortcode)
        'has_archive'        => false,
        'rewrite'            => false,
        'menu_icon'          => 'dashicons-editor-code',
    );

    register_post_type( 'wcp_code_snippets', $args );
}
add_action( 'init', 'ssc_register_cpt' );

/**
 * Enqueue frontend scripts
 */
function ssc_enqueue_assets() {
    // script
    wp_register_script(
        'ssc-frontend',
        plugin_dir_url( __FILE__ ) . 'assets/js/shortcode-snippets-copier.js',
        array(),
        '1.0',
        true
    );

    $i18n = array(
        'copied' => __( 'Code copied to clipboard', 'shortcode-snippets-copier' ),
        'failed' => __( 'Failed to copy shortcode. Please copy manually.', 'shortcode-snippets-copier' ),
    );

    wp_localize_script( 'ssc-frontend', 'ssc_vars', array(
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'nonce'    => wp_create_nonce( 'ssc_copy_nonce' ),
        'i18n'     => $i18n,
    ) );

    wp_enqueue_script( 'ssc-frontend' );
}
add_action( 'wp_enqueue_scripts', 'ssc_enqueue_assets' );

/**
 * AJAX handler: return raw snippet content by ID
 */
function ssc_ajax_get_snippet() {
    // nonce
    $nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['nonce'] ) ) : '';
    if ( ! wp_verify_nonce( $nonce, 'ssc_copy_nonce' ) ) {
        wp_send_json_error( 'invalid_nonce' );
    }

    $id = isset( $_POST['id'] ) ? intval( $_POST['id'] ) : 0;
    if ( ! $id ) {
        wp_send_json_error( 'invalid_id' );
    }

    $post = get_post( $id );
    if ( ! $post || 'wcp_code_snippets' !== $post->post_type ) {
        wp_send_json_error( 'not_found' );
    }

    // Only allow published publicly visible snippets for non-logged-in users.
    if ( 'publish' !== $post->post_status && ! current_user_can( 'edit_post', $id ) ) {
        wp_send_json_error( 'not_allowed' );
    }

    // Get raw content (do NOT run do_shortcode or apply filters)
    $content = get_post_field( 'post_content', $id, 'raw' );
    if ( null === $content ) {
        wp_send_json_error( 'empty' );
    }

    // Return the raw content
    wp_send_json_success( array(
        'shortcode' => $content,
    ) );
}
add_action( 'wp_ajax_ssc_get_snippet', 'ssc_ajax_get_snippet' );
add_action( 'wp_ajax_nopriv_ssc_get_snippet', 'ssc_ajax_get_snippet' );

/**
 * Code helper to output button easily:
 * [wcp_code_copy_btn id="123" label="Copy Code" class="my-class"]
 */
function ssc_copy_button_shortcode( $atts ) {
    $atts = shortcode_atts(
        array(
            'id'    => 0,
            'label' => __( 'Copy Code', 'shortcode-snippets-copier' ),
            'class' => '',
        ),
        $atts,
        'wcp_code_copy_btn'
    );

    $id = intval( $atts['id'] );
    if ( ! $id ) {
        return '';
    }

    $label = esc_html( $atts['label'] );
    $class = esc_attr( $atts['class'] );

    return '<button type="button" class="wcp-code-copy-btn ' . $class . '" data-shortcode-id="' . esc_attr( $id ) . '">' . $label . '</button>';
}
add_shortcode( 'wcp_code_copy_btn', 'ssc_copy_button_shortcode' );
