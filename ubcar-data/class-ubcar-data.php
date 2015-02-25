<?php
    
    /**
     * The UBCAR_Data superclass
     * 
     * This file defines the UBCAR_Data superclass and requires its subclasses,
     * allowing UBCAR data to be used on its frontend and by associated apps.
     * 
     * @package UBCAR
     */

    /**
     * Requires the Data KML and Point Data JSON subclasses.
     */
    require_once( plugin_dir_path(__FILE__).'class-ubcar-data-kml.php' );
    require_once( plugin_dir_path(__FILE__).'class-ubcar-data-geojson.php' );
    require_once( plugin_dir_path(__FILE__).'class-ubcar-data-json-point.php' );
    
    /**
     * The UBCAR_Data superclass.
     */
    class UBCAR_Data {
    
        var $ubcar_data_kml;
        var $ubcar_data_geojson;
        var $ubcar_data_json_point;
    
        /**
         * The UBCAR_Data constructor
         * 
         * @access public
         * @return void
         */
        public function __construct() {
            $this->ubcar_data_kml = new UBCAR_Data_KML();
            $this->ubcar_data_geojson = new UBCAR_Data_GeoJSON();
            $this->ubcar_data_json_point = new UBCAR_Data_JSON_Point();
        }
        
        /**
         * This function adds the UBCAR_Data actions.
         * 
         * @access public
         * @return void
         */
        function add_actions() {
        }
        
        /**
         * This function adds the UBCAR_Data shortcodes.
         * 
         * @access public
         * @return void
         */
        function add_shortcodes() {
        }
        
        
        
    }
    
?>
