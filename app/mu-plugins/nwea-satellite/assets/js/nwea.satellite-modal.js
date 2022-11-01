/* global $ ID satellite_obj */
var SatelliteModalUtil = function( options){
	
	var root = this;
	
	var settings = {
		container		  : null,
		satellite_form_id : null,
		debug			  : false
	};
	
	var player;
	
	this.construct = function( options )
	{
        root.settings = jQuery.extend(true , options);
        
		// - Debug
    	if( true === root.settings.debug ){
    		window.console.log('%c [DEBUG] options', 'background: #222; color: #bada55');
    		window.console.log(options);
    	}
    	
        if( true === root.settings.debug ){
    		window.console.log('%c [DEBUG] root.settings', 'background: #222; color: #bada55');
    		window.console.log(root.settings);
    	}

    };

    this.update_url_leadId = function ( val )
    {
    	/* Update the url with the leadId */
	    var loc = document.location.href;    
	    var title = document.title;
	    loc += loc.indexOf("?") === -1 ? "?" : "&";
	    
	    window.history.pushState(val, title, loc + "leadId="+val );
    };

    //  $_satellite_modal_utils.settings.satellite_form_id is passed as form_id
    
    this.hide_marketo_form = function ( user = false, closeMethod = null, theTimeout = null )
    {
		closeMethod = closeMethod || $_satellite_modal_utils.settings.closeMethod;
		theTimeout	= theTimeout || $_satellite_modal_utils.settings.theTimeout;
    	
    	if( true === $_satellite_modal_utils.settings.debug ){
    		window.console.log('%c [DEBUG] ' + $_satellite_modal_utils.settings.satellite_form_id + ' - form_id', 'background: #222; color: #bada55');
    		window.console.log('%c [DEBUG] ' + closeMethod + ' - closeMethod', 'background: #222; color: #bada55');
    		window.console.log('%c [DEBUG] ' + theTimeout + ' - theTimeout', 'background: #222; color: #bada55');
    	}
    	
    	if(true === user){
    		
    		if( typeof( $_satellite_modal_utils.settings.satellite_form_id ) !== 'undefined' ){
    			
		        jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"]').fadeOut();
		        jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .intro .description').fadeOut().remove();
		        
		        setTimeout(function(){
		            jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .mkto-form-success').fadeIn();
		        },1000);
		        
    		}
    		
	        setTimeout(function(){
		        // A little after success fades in...
		        jQuery('.satellite_modal .intro_wrapper').hide();
		        jQuery('.satellite_modal .success_wrapper').hide().fadeIn(600);
	    	},1200);
	    
     		if( 'button' == closeMethod ){
     			// Do not close!
	 		}else{
	 			setTimeout( function(){ jQuery('.satellite_modal').modal('hide'); }, theTimeout );
	 		}
	        
	        /* Replace Gate Modal button with gated content */
	        // @GK @DEP TODO Convert to footer jQuery('a[data-bs-target]').fadeOut('slow');
	        
    	} else {
    		
    		jQuery('.satellite_modal [data-marketo-form-id]').fadeOut();
		    jQuery('.satellite_modal [data-marketo-form-id] .intro .description').fadeOut().remove();
		    
		    setTimeout( function () {
		        jQuery('.satellite_modal [data-marketo-form-id] .mkto-form-success').fadeIn();
		    },1000);
		    
		    setTimeout( function () {
		        // A little after success fades in...
		        jQuery('.satellite_modal .intro_wrapper').hide();
		        jQuery('.satellite_modal .success_wrapper').hide().fadeIn(600);
			},1200);
		
		 	jQuery('.satellite_modal').modal('hide');
    	}
    };
    
    /* gate_callback.form_prefill */
    this.attach_events_to_inputs = function ( satellite_form_id ) 
    {
    	// window.console.log('6B satellite attaching input events to form id -' + satellite_form_id);
	    var _inputs   = jQuery('.satellite_modal [data-marketo-form-id="' + satellite_form_id + '"] .mktoFormRow .mktoFormCol .mktoField:not(select)'),
			_select   = jQuery('.satellite_modal [data-marketo-form-id="' + satellite_form_id + '"] .mktoFormRow select'),
			_textarea = jQuery('.satellite_modal [data-marketo-form-id="' + satellite_form_id + '"] .mktoFormRow textarea');
	
		jQuery.each( _inputs, function( i, val ) {
		    jQuery(this).on('focusin',function(){
		        jQuery(this).siblings('label').addClass('label-focus');
		    });
		
		    jQuery(this).on('focusout',function(){
		        if ( 0 === jQuery(this).val().length ) {
		            jQuery(this).siblings('label').removeClass('label-focus');
		        }
		    });
		});
		
		// Adjust labels that are newly created on change
		jQuery.each( _select, function( i, val ) {
			jQuery(this).siblings('label').addClass('transform-instant select-label');
		});
		
		// Adjust labels that are long after a change
		jQuery.each( _inputs, function( i, val ) {
			if( 34 <= jQuery(this).siblings('label:eq(0)').text().length ){
				jQuery(this).parent('.mktoFieldWrap').addClass('longLabel');
			}
		});
		
		jQuery.each( _select, function( i, val ) {
			if( 34 <= jQuery(this).siblings('label:eq(0)').text().length ){
				jQuery(this).parent('.mktoFieldWrap').addClass('longLabel');
			}
		});
		
		jQuery.each( _textarea, function( i, val ) {
			if( 34 <= jQuery(this).siblings('label:eq(0)').text().length ){
				jQuery(this).parent('.mktoFieldWrap').addClass('longLabel');
			}
		});
    };

    this.change_stage = function ( stage_id )
    {
    	/* global Marketo */
    	if( true === $_satellite_modal_utils.settings.debug ){
    		Marketo.form.vals({formCount: parseInt(stage_id) });
    		$satellite_modal_cb.form_prefill();
    	}
    };

	this.construct(options);
};

// *Gate Utilities Constructor
var $_satellite_modal_utils; // Initialised class later in the footer load callback to set the form_id once
 
var SatelliteModalCallback = function ( options )
{
			
	var settings = {};
	var root = this;
	
	this.construct = function( options )
	{
		// As in the example to setting up a constructor
        jQuery.extend(settings , options);
    };
    
    this.form_load = function ( e ) 
    {
        var _inputs       = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .mktoFormRow .mktoFormCol .mktoField:not(select)'),
            _select       = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .mktoFormRow select:not([type="checkbox"])'),
            _textarea     = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .mktoFormRow textarea');

        // Selecting and adding a new class to the optin column
        jQuery(".satellite_modal [data-marketo-form-id='" + $_satellite_modal_utils.settings.satellite_form_id + "'] input[type='checkbox'][name*='Optin']").closest('.mktoFormCol').addClass('mktoOptinCol');
        
        // Selecting .mktoFormRow's with just one hidden field and hiding the row
        jQuery(".satellite_modal [data-marketo-form-id='" + $_satellite_modal_utils.settings.satellite_form_id + "'] input[type='hidden']:only-of-type").parent('.mktoFormRow').addClass('mktoHiddenCol');
        
        /* Apply Select Labels classes */
        jQuery.each( _select, function( i, val ) {
        	jQuery(this).siblings('label').addClass('select-label').parent('.mktoFieldWrap').addClass('selectFieldWrap');
        });
        	
        setTimeout(function() {
            _select.siblings('label').addClass('transform-instant select-label').parent('.mktoFieldWrap').addClass('selectFieldWrap');
            _textarea.siblings('label').addClass('label-focus');
        }, 200);
        
        // @GK Dep: _textarea.siblings('label').addClass('label-focus');
    	
    	// - Debug
    	if( true === $_satellite_modal_utils.settings.debug ){
    		window.console.log('%c [DEBUG] ID:' + $_satellite_modal_utils.settings.satellite_form_id + ' - Form loaded', 'background: #222; color: #bada55');
    	}
    };
    
    this.localize_prefill = function ()
    {
        var _src		  = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] input[name="Most_Recent_Source__c"]'),
        	_lsd		  = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] input[name="Most_Recent_Source_Detail__c"]'),
        	_cid		  = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] input[name="Most_Recent_Campaign__c"]'),
        	_r_name		  = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] input[name="Most_Recent_Resource__c"]'),
        	_r_type		  = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] input[name="Most_Recent_Resource_Type__c"]'),
        	_r_prim_topic = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] input[name="Most_Recent_Resource_Topic__c"]'),
        	_r_product 	  = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] input[name="Most_Recent_Product__c"]');
			
	        if( '' != satellite_obj['cid'] || '7015Y000003fSxUQAU' != satellite_obj['cid'] || !window.localStorage.getItem("cid")){
	        	window.localStorage.setItem("cid", satellite_obj['cid']);
	        }else{
				window.localStorage.setItem("cid", '7015Y000003fSxUQAU');
			}
	        
	        if( 'website' != satellite_obj['src'] || !window.localStorage.getItem("src")){
	        	window.localStorage.setItem("src", satellite_obj['src']);
	        }else{
				window.localStorage.setItem("src", 'website');
			}
	        
	        if( 'organic' != satellite_obj['lsd'] || !window.localStorage.getItem("lsd")){
	        	window.localStorage.setItem("lsd", satellite_obj['lsd']);
	        }else if( 'organic' != satellite_obj['lsd'] && 'organic' == window.localStorage.getItem("lsd") ){
	        	window.localStorage.setItem("lsd", satellite_obj['lsd']);
	        }else{
				window.localStorage.setItem("lsd", 'organic');
			}
	        
        	_src.attr('value', window.localStorage.getItem("src") );
        	_lsd.attr('value',window.localStorage.getItem("lsd") );
        	_cid.attr('value',window.localStorage.getItem("cid") );
        	
        	if ( window.localStorage.getItem("nwea_resource") ){
	        	let nwea_resource = JSON.parse( window.localStorage.getItem("nwea_resource") );
	        	
	        	let _rw_name = nwea_resource["last_r_name"];
	        		_rw_name = _rw_name.charAt(0).toUpperCase() + _rw_name.slice(1);
	        	
	    		_r_name.attr('value',		_rw_name );
	        	_r_type.attr('value',		nwea_resource["last_r_type"] );
	        	_r_prim_topic.attr('value', nwea_resource["last_r_primary_topic"] );
	        	_r_product.attr('value',	nwea_resource["last_r_product"] );
        	}
        	
			/*
			 *  Additional UTM Name, Type, Topic
			 *  @since - v2.5.4
			 */
			 /* global URLSearchParams */
			 
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			let _utm_name, _utm_topic, _utm_type;
			
		    if( !jQuery('body').hasClass('resource-center') && !jQuery('body').hasClass('single') ){
		    	if( urlParams.has('utm_name') ){
		    		_utm_name = urlParams.get('utm_name');
		    		_utm_name = _utm_name.charAt(0).toUpperCase() + _utm_name.slice(1);
		    		window.localStorage.setItem("utm_name", _utm_name);
		    	}
		    	
		    	if( urlParams.has('utm_topic') ) {
		    		_utm_topic = urlParams.get('utm_topic');
		    		window.localStorage.setItem("utm_topic", _utm_topic);
		    	}
		    	
		    	if( urlParams.has('utm_type') ){
		    		_utm_type = urlParams.get('utm_type');
		    		window.localStorage.setItem("utm_type", _utm_type);
		    	}
		    	
		    	
		    	if( window.localStorage.getItem("utm_name") ){
		    		_r_name.attr('value', window.localStorage.getItem("utm_name") );
		    	}
		    	
	    		if( window.localStorage.getItem("utm_topic") ){
		    		_r_prim_topic.attr('value', window.localStorage.getItem("utm_topic") );
		    	}
		    	
		    	if( window.localStorage.getItem("utm_type") ){
		    		_r_type.attr('value', window.localStorage.getItem("utm_type") );
		    	}
			 
			 } // /!body.resource-center
    }
    
    this.finish_loading = function ()
    {
    	jQuery('.satellite_modal [data-marketo-form-id]').removeClass('loading');
    }
    
    this.form_prefill = function (e) 
    {
    	var _prefilled;
    	/* Implementation */
		// - Get form ID
		// Access the form_id in utils `$_satellite_modal_utils.settings.satellite_form_id`
		
		setTimeout(function(){ // [setTimeout:50]
		// - select form elements specific to form_id
            var _inputs   = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .mktoFormRow .mktoFormCol .mktoField'),
	            _select       = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .mktoFormRow select'),
	            _textarea     = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .mktoFormRow textarea');
			// - overwrite phone number label copy
			// @GK Adding custom label text to phone, because Marketo won't allow me to change the label for that field.
    		var _phone = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] #Phone');
    		// @GK Changing the Phone's label to be custom
    		_phone.siblings('label').html('<div class="mktoAsterix">*</div> PHONE NUMBER');
			// - Find prefilled inputs and give them a label of focus, when they aren't empty
			_prefilled = jQuery('.satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .mktoFormRow input, .satellite_modal [data-marketo-form-id="' + $_satellite_modal_utils.settings.satellite_form_id + '"] .mktoFormRow select').not('[type="checkbox"]').filter( function () { return !!this.value; } );
			// - On prefilled fields, attach onfocus, focusout events
			_prefilled.on('focusin',function(){
                jQuery(this).siblings('label').addClass('label-focus');
            });

            _prefilled.on('focusout',function(){
                if (jQuery(this).val().length === 0) {
                    jQuery(this).siblings('label').removeClass('label-focus');
                }
            });
            
            _prefilled.siblings('label').addClass('label-focus');
			// - $_satellite_modal_utils.attach_events_to_inputs(form_id);
			// window.console.log('5B get satellite form id - ' + $_satellite_modal_utils.settings.satellite_form_id);
			
			$_satellite_modal_utils.attach_events_to_inputs( $_satellite_modal_utils.settings.satellite_form_id );
			
			// - Add a change event to each select dropdown
			//	- @GK setTimeout because New fields may show up after a selection
	        jQuery.each( _select, function( i, val ) {
		        jQuery(this).on('change', function() {
		        	if( true === $_satellite_modal_utils.settings.debug ){
		        		window.console.log('%c [DEBUG] fired only once please! (' + i + ')', 'background: #222; color: #bada55');
		        	}
		            setTimeout(function(){ $_satellite_modal_utils.attach_events_to_inputs( $_satellite_modal_utils.settings.satellite_form_id ); }, 75);
		        });
	        });
	        
			// - Give select fields a wrap class
            _select.siblings('label').addClass('transform-instant select-label').parent('.mktoFieldWrap').addClass('selectFieldWrap');
            
            jQuery("select[multiple]:not('.dom-select')").each(function(){
				var el = jQuery(this);
				
				if ( !el.parents('.satellite_modal').length ) {
			 		return false;
				}
					
				el.addClass('dom-select');
				
				el.multiselect({
					buttonContainer: '<div class="btn-group multi-group"></div>',
					selectedClass: 'active multiselect-selected',
					numberDisplayed: 1,
					nonSelectedText: 'Select all that apply...',
				});
				
				setTimeout(function(){
					el.siblings('.btn-group')
						.children('.dropdown-menu')
						.children('.multiselect-option.dropdown-item[title^="Select"]')
						.remove();
				}, 500);
				
				setTimeout(function(){
					if( null !== el.val() ){
						if( 1 == el.val().length && "" == el.val()[0] ){
							el.val([]);
						}else{
						   el.multiselect('select', el.val() );
						}
					}
				}, 1000);
				
				setTimeout(function(){
					jQuery(this).trigger('change');
				}, 1200);
			});
			
            _select.on('change', function(){
            	setTimeout(function(){
	                _inputs       = jQuery('.satellite_modal [data-marketo-form-id="'+$_satellite_modal_utils.settings.satellite_form_id+'"] .mktoFormRow .mktoFormCol .mktoField'),
	                _select       = jQuery('.satellite_modal [data-marketo-form-id="'+$_satellite_modal_utils.settings.satellite_form_id+'"] .mktoFormRow select'),
	                _textarea     = jQuery('.satellite_modal [data-marketo-form-id="'+$_satellite_modal_utils.settings.satellite_form_id+'"] .mktoFormRow textarea');
	                        
	                // Adjust labels that are newly created on change
	                _select.siblings('label').addClass('transform-instant select-label');
	
	                _inputs.on('focusin',function(){
	                    jQuery(this).siblings('label').addClass('label-focus');
	                });
	        
	                _inputs.on('focusout',function(){
	                    if (jQuery(this).val().length === 0) {
	                        jQuery(this).siblings('label').removeClass('label-focus');
	                    }
	                });
	                
	                // Change tracking for Multiselect here
					jQuery("select[multiple]:not('.dom-select')").each(function(){
						var el = jQuery(this);
						
						if ( !el.parents('.satellite_modal').length ) {
						 	return false;
						}
						 	
						el.addClass('dom-select');
		
						el.multiselect({
							buttonContainer: '<div class="btn-group multi-group"></div>',
							selectedClass: 'active multiselect-selected',
							numberDisplayed: 1,
							nonSelectedText: 'Select all that apply...',
						});
					
						setTimeout(function(){
							el.siblings('.btn-group')
								.children('.dropdown-menu')
								.children('.multiselect-option.dropdown-item[title^="Select"]')
								.remove();
						}, 500);
						
						setTimeout(function(){
							if( null !== el.val() ){
								if( 1 == el.val().length && "" == el.val()[0] ){
									el.val([]);
							   }else{
								   el.multiselect('select', el.val() );
							   }
							}
						}, 1000);
					});
            	}, 100);
            });
            
		}, 50); // ./setTimeout
		
	   	// - Debug
    	if( true === $_satellite_modal_utils.settings.debug ){
    		window.console.log('%c [DEBUG] ID:' + $_satellite_modal_utils.settings.satellite_form_id + ' - Form just got prefilled', 'background: #222; color: #bada55');
    	}
    };
    
    this.form_success = function (e)
    { 
		// Access the form_id & lead_id in utils `$_satellite_modal_utils.settings.satellite_form_id...`
    	$_satellite_modal_utils.hide_marketo_form( true );

	    // - Debug
		if( true === $_satellite_modal_utils.settings.debug ){
    		window.console.log('%c [DEBUG] ID:' + $_satellite_modal_utils.settings.satellite_form_id + ' - Form was submitted', 'background: #222; color: #bada55');
    	}
    };

    this.construct(options);
};

// *Gate Callback Constructor
var $satellite_modal_cb = new SatelliteModalCallback();

function satellite_modal_form_load(load_satellite_modal_form_id, closeMethod, theTimeout = 3500, openFileDelay = 1000){
	/* global jQuery */
	window.addEventListener( 'marketo_form_load', function ( e ) {
		if( parseInt(load_satellite_modal_form_id) == parseInt( e.detail.form_id ) ){
			// Set up SatelliteModalUtil class with form details
			$_satellite_modal_utils = new SatelliteModalUtil({
				container     : jQuery('.maincol .asset_holder'),
				satellite_form_id : parseInt(load_satellite_modal_form_id), // parseInt( e.detail.form_id ),
				closeMethod   : closeMethod,
				theTimeout	  : theTimeout,
				openFileDelay : openFileDelay,
				debug		  : false,
			});
			
			if( true === $_satellite_modal_utils.settings.debug ){
				window.console.log('%c [DEBUG:Satellite] Satellite Script just found ' + e.detail.form_id , 'background: #222; color: #bada55');
				window.console.log('%c [DEBUG:Satellite] Initialised $_satellite_modal_utils' , 'background: #222; color: #bada55');
			}

			$satellite_modal_cb.form_load();
		}
	} );
	
	window.addEventListener( 'marketo_form_prefill', function ( e ) {
		if( parseInt(load_satellite_modal_form_id) == parseInt( e.detail.form_id ) ){
			
			if( true === $_satellite_modal_utils.settings.debug ){
				window.console.log('%c [DEBUG:Satellite] marketo_form_prefill - ' + load_satellite_modal_form_id, 'background: #222; color: #bada55');
			}
			
			setTimeout(function(){
				$satellite_modal_cb.form_prefill();
				if( typeof satellite_obj !== 'undefined' ){
					$satellite_modal_cb.localize_prefill();
				}
				$satellite_modal_cb.finish_loading();	
			}, 500);
		}
	});
	
	window.addEventListener( 'marketo_form_success', function ( e ) {
		if( parseInt(load_satellite_modal_form_id) == parseInt( e.detail.form_id ) ){
		    // Merge $util.settings with new lead_id
		    jQuery.extend( $_satellite_modal_utils.settings, { lead_id : parseInt( e.detail.lead_id ) } );

			if( true === $_satellite_modal_utils.settings.debug ){
	    		// window.console.log('%c [DEBUG] Lead ID :' + $_satellite_modal_utils.settings.lead_id + ' - Lead ID retrieved', 'background: #222; color: #bada55');
	    	}
	    	
			$satellite_modal_cb.form_success();
		}
	} );
	
	window.addEventListener('load', function ( e ) {
		// Page is fully loaded
		var form_context = jQuery('.satellite_modal');
		
		if (typeof MktoForms2 === 'undefined') {
		  form_context.addClass('not_loaded');
		}
	} );
}