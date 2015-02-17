<?php
    
    /**
     * The UBCAR_View superclass
     * 
     * This file defines the UBCAR_View superclass and requires its subclasses,
     * allowing UBCAR data to be viewed on its frontend.
     * 
     * UBCAR_View depends on Google Maps, jQuery, and (optionally) UBC CTLT's
     * Wiki-Embed plugin.
     * 
     * @package UBCAR
     */

    /**
     * Requires the View Map subclass.
     */
    require_once( plugin_dir_path(__FILE__).'class-ubcar-view-map.php' );
    
    /**
     * The UBCAR_View superclass.
     */
    class UBCAR_View {
    
        var $ubcar_view_map;
    
        /**
         * The UBCAR_View constructor
         * 
         * @access public
         * @return void
         */
        public function __construct() {
            $this->ubcar_view_map = new UBCAR_View_Map();
        }
        
        /**
         * This function adds the UBCAR_View actions.
         * 
         * @access public
         * @return void
         */
        function add_actions() {
        }
        
        /**
         * This function adds the UBCAR_View shortcodes.
         * 
         * @access public
         * @return void
         */
        function add_shortcodes() {
        }
        
        
        
    }
    
?>
