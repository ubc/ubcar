<?php
	/**
	 * A redirection page
	 * 
	 * This file redirects users to the designated return URL.
	 * 
	 * @package UBCAR
	 */
	
	if( isset( $_GET['return'] ) && $_GET['return'] != '' ) {
		header( "Location: " . $_GET['return'] );
	} else {
		echo "UBCAR has encountered an error. Please return to the previous page and try your action again.";
	}
	exit;
?>
