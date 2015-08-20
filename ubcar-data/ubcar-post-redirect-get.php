<?php
	/**
	 * A redirection page
	 *
	 * This file redirects users to the designated return URL.
	 *
	 * @package UBCAR
	 */

	if( isset( $_GET['return'] ) && $_GET['return'] != '' ) {
		if( isset( $_GET['point'] ) && $_GET['point'] != '' ) {
			header( "Location: " . $_GET['return'] . "&point=" . $_GET['point'] );
		} else if( isset( $_GET['point_map'] ) && $_GET['point_map'] != '' ) {
			header( "Location: " . $_GET['return'] . "?point=" . $_GET['point_map'] );
		} else {
			header( "Location: " . $_GET['return'] );
		}
	} else {
		echo "UBCAR has encountered an error. Please return to the previous page and try your action again.";
	}
	exit;
?>
