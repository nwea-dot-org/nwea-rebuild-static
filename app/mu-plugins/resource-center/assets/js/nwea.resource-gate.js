/* global $ ID satellite_obj */
var GateUtil = function( options){
	
	var root = this;
	
	var settings = {
		container : null,
		gate_form_id   : null,
		post_id   : null,
		debug	  : false
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

    this.time_to_lck = function () 
    {
    	// Satellite did not get called initially
    	if( !jQuery('.asset_holder').hasClass('unlocked') && !jQuery('.asset_holder').hasClass('satellite') && !jQuery('.asset_holder').hasClass('allow_all') ) 
    	{
    		window['offer_lock']();
			window.console.log('%c [NWEA RESOURCE CENTER] Satellite did not init.', 'background: #fbdd79; color: #414142');
    	}
    	
    };
    
    //  $utils.settings.gate_form_id is passed as gate_form_id
    
    this.hide_marketo_form = function ( user = false, closeMethod = null, theTimeout = null )
    {
		closeMethod = closeMethod || $utils.settings.closeMethod;
		theTimeout	= theTimeout || $utils.settings.theTimeout;
    	
    	if( true === $utils.settings.debug ){
    		window.console.log('%c [DEBUG] ' + $utils.settings.gate_form_id + ' - gate_form_id', 'background: #222; color: #bada55');
    		window.console.log('%c [DEBUG] ' + closeMethod + ' - closeMethod', 'background: #222; color: #bada55');
    		window.console.log('%c [DEBUG] ' + theTimeout + ' - theTimeout', 'background: #222; color: #bada55');
    	}
    	
    	if(true === user){
    		
    		if( typeof( $utils.settings.gate_form_id ) !== 'undefined' ){
    			
		        jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"]').fadeOut();
		        jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .intro .description').fadeOut().remove();
		        
		        setTimeout(function(){
		            jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .mkto-form-success').fadeIn();
		        },1000);
		        
    		}
    		
	        setTimeout(function(){
		        // A little after success fades in...
		        jQuery('#gated .intro_wrapper').hide();
		        jQuery('#gated .success_wrapper').hide().fadeIn(600);
	    	},1200);
	    
     		if( 'button' == closeMethod ){
     			// Do not close!
	 		}else{
	 			setTimeout( function(){ jQuery('#gated').modal('hide'); }, theTimeout );
	 		}
	        
	        /* Replace Gate Modal button with gated content */
	        jQuery('a[data-bs-target="#gated"]').fadeOut('slow');
	        
    	} else {
    		
    		jQuery('#gated [data-marketo-form-id]').fadeOut();
		    jQuery('#gated [data-marketo-form-id] .intro .description').fadeOut().remove();
		    
		    setTimeout( function () {
		        jQuery('#gated [data-marketo-form-id] .mkto-form-success').fadeIn();
		    },1000);
		    
		    setTimeout( function () {
		        // A little after success fades in...
		        jQuery('#gated .intro_wrapper').hide();
		        jQuery('#gated .success_wrapper').hide().fadeIn(600);
			},1200);
		
		 	jQuery('#gated').modal('hide');
    	}
    };

	/*
	 *  Reset params found in the url
	 *  - reveal the gate
	 *  - update the url
	 *  @since - v2.1.6
	 */
	this.form_reset_url = function ( urlParams )
	{
    	let newUrl;
        switch(urlParams.get('form-type')) {
            case '2':
            	this.reveal_gate_form();
                this.update_url_form_reset();
                
                break;
        }
	}
	
	/*
	 *  Show the form for a new user
	 *  @since - v2.1.6
	 */
	this.reveal_gate_form = function ( )
	{
        jQuery('#gated').modal('show');
	}
	
	/*
	 *  Use pushState to replace the URL, and lastly replace delimiter '?'
	 *  @since - v2.1.6
	 */
	this.update_url_form_reset = function ( )
	{
        let newUrl= String( document.location.href ).replace( 'form-reset=1&form-type=2', "" ).replace( /\?$/,'' );
        window.history.pushState("", "", newUrl);
	}
	
    this.unlock_html_via_modal = function ( data ) 
    { 
		var txtdiv = jQuery('.asset_holder .txtcol'),
			el = jQuery('<div />',{
			class: 'article'
		}).append(data['full-content']);
		var height = txtdiv.height();
		txtdiv.css( 'height', height );
		
		
		setTimeout(function(){
			// Simulate time to reveal the success message following form submission
			jQuery('.asset_holder .btn-cta').fadeOut('fast',function(){
	    		txtdiv.wrapInner('<div class="content"/>').children('.content').replaceWith( el );
	    		txtdiv.addClass('html_transition').css({'height':el[0].scrollHeight});
				setTimeout(function(){
					txtdiv.css({'height':'auto'}).removeClass('html_transition');
					jQuery('.txtcol .closer').fadeOut(function(){ jQuery(this).remove(); });
				},1500);
	    	});
		},1500);
    };
    
    this.unlock_html_via_satellite = function ( data )
    {
    	$utils.hide_marketo_form();
    	
    	var cta_gate = jQuery('a[data-bs-target="#gated"]');
    	var btn_div = jQuery('.asset_holder .btn-cta');
		var btn_class = btn_div.attr('class').replace('show-survey','').replace('ready','').trim();
		var cta = jQuery('<a />',{
				class: btn_class,
				title: jQuery('.show-survey').text(),
				text: jQuery('.show-survey').text(),
				href: '#'
			});
		
		cta.on('click',function(e){
			e.preventDefault();

			var txtdiv = jQuery('.asset_holder .txtcol'),
					el = jQuery('<div />',{
					class: 'article'
				}).append(data['full-content']);
			var height = txtdiv.height();
			txtdiv.css( 'height', height );
			
	    	jQuery('.asset_holder .btn-cta').fadeOut('fast',function(){
	    		txtdiv.wrapInner('<div class="content"/>').children('.content').replaceWith( el );
	    		txtdiv.addClass('html_transition').css({'height':el[0].scrollHeight});
	    			// Fade out the text fade out 
				setTimeout(function(){
					txtdiv.css({'height':'auto'}).removeClass('html_transition');
	    			jQuery('.txtcol .closer').fadeOut(function(){ jQuery(this).remove(); });
				},1500);
	    	});
	    	
	    	return false;
		});
		
		/* Replace Gate Modal button with gated content */
		/* Moved to ajax method so the button does not hide for long */
		cta_gate.wrap( "<div class='cta_unlocked'></div>" );
		cta_gate.parent().css('height',cta_gate[0].scrollHeight);
		cta_gate.replaceWith(cta)

		// Ready to launch and autoplay video
		cta.addClass('ready');
    }
    
    // Executes inside ajax call for the full post
    this.read_more_html = function ( data )
    {
		var txtdiv = jQuery('.asset_holder .txtcol'),
			el = jQuery('<div />',{
					class: 'article'
				 }).append(data['full-content']);
		var height = txtdiv.height();
		txtdiv.css( 'height', height );
    	
    	jQuery('.asset_holder .btn-cta').fadeOut('slow',function(){
    		txtdiv.wrapInner('<div class="content"/>').children('.content').replaceWith( el );
    		txtdiv.addClass('html_transition').css({'height':el[0].scrollHeight});
			setTimeout(function(){
				txtdiv.css({'height':'auto'}).removeClass('html_transition');
				jQuery('.txtcol .closer').fadeOut(function(){ jQuery(this).remove(); });
			},1000);
    	});
    	
    };

	this.unlock_video_via_satellite = function ( data )
	{
		$utils.hide_marketo_form();
		
		var btn_div = jQuery('.asset_holder .btn');
		var btn_class = btn_div.attr('class').replace('show-survey','').replace('ready','').trim();
		var cta = jQuery('<a />',{
				class: btn_class,
				title: jQuery('.show-survey').text(),
				text: jQuery('.show-survey').text(),
				href: '#'
			}),
			el_embed = data['video-embed'];

		cta.on('click', function(e){
			e.preventDefault();
			
			$utils.unlock_video_via_modal( data );
			
			return false;
		});
		
		btn_div.replaceWith(cta);
		
		// Ready to launch and autoplay video
		cta.addClass('ready');
	};
	
    this.unlock_video_via_modal = function ( data, user = false )
    { 
    	var theTimeout;
    	if( true === user ){
    		theTimeout = $utils.settings.theTimeout || 1000;
    	}else{
    		theTimeout = 2000;
    	}
    	
		var videodiv = jQuery('.embed_container'),
			el = data['video-embed'];
	
		videodiv.animate({'opacity':0}, 'fast',function(){
			jQuery(this).empty()
				   .append("<div class='play_frame'></div>");
			jQuery('.embed_container .play_frame').append(el);

			jQuery('.play_frame').css('opacity',0).animate({'opacity':1}, 750,function(){
				jQuery(this).addClass('locked');
			});

			jQuery(this).delay(300)
				   .animate({opacity: 1});
		}).fadeIn('slow',function(){
			var iframe = document.querySelector('.play_frame iframe'); 
			$utils.player = new Vimeo.Player(iframe);
			
			setTimeout(function(){
				$utils.player.play();
			}, (theTimeout - 750) );
		});
		
		if( true === user ){
			jQuery([document.documentElement, document.body]).animate({
		        scrollTop: ( jQuery(".embed_container").offset().top - 50 - jQuery('.asset_holder .introcol')[0].scrollHeight - jQuery('.asset_holder .txtcol')[0].scrollHeight )
		    }, 1500);
		}
    };
    
    this.unlock_download = function ( data, user = true )
    {
    	var btn_div = jQuery('.asset_holder .btn-cta');

		var btn_class = btn_div.attr('class').replace('show-survey','').replace('ready','').trim();

		var el = jQuery('<a />',{
			class: btn_div.attr('class'),
			title: jQuery('.asset_holder .show-survey').text(),
			href: data.link,
			target: '_blank',
			text: jQuery('.asset_holder .show-survey').text()
		});
		
		btn_div.replaceWith(el);
		jQuery('.success_wrapper button').addClass('btn-dismiss');
		el.clone().insertBefore( jQuery('.success_wrapper > p:last-child') );
		
		if( true === user ){
    		// Open the link to the asset
    		setTimeout( function() { jQuery('.success_wrapper > .btn')[0].click(); }, $utils.settings.openFileDelay);
		}
    };
    
    /* gate_callback.form_prefill */
    this.attach_events_to_inputs = function ( gate_form_id ) 
    {
    	// window.console.log('6A gates attaching input events to form id -' + gate_form_id);
	    var _inputs   = jQuery('#gated [data-marketo-form-id="' + gate_form_id + '"] .mktoFormRow .mktoFormCol .mktoField:not(select)'),
			_select   = jQuery('#gated [data-marketo-form-id="' + gate_form_id + '"] .mktoFormRow select'),
			_textarea = jQuery('#gated [data-marketo-form-id="' + gate_form_id + '"] .mktoFormRow textarea');
	
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
    	if( true === $utils.settings.debug ){
    		Marketo.form.vals({formCount: parseInt(stage_id) });
    		$gate_cb.form_prefill();
    	}
    };
    
    this.lock_debug = function ()
    {
    	if( true === root.settings.debug && !jQuery('.asset_holder').hasClass('satellite') && !jQuery('.asset_holder').hasClass('allow_all') )
    	{
			window['offer_lock']();
		}
    }
    
	this.construct(options);
};

// *Gate Utilities Constructor
var $utils; // Initialised class later in the footer load callback to set the gate_form_id once
 
var GateCallback = function ( options )
{
			
	var settings = {};
	var root = this;
	
	this.construct = function( options )
	{
		// As in the example to setting up a constructor
        jQuery.extend(settings , options);
    };
    
    this.offer_lock = function ( )
    {
    	// Signaling that this ran
    	jQuery('.asset_holder').addClass('satellite');
    	
    	// Locking callback goes here
    	if( jQuery('.asset_holder').hasClass('video_layout') ){
			jQuery('.play_frame').css('opacity',0).animate({'opacity':1}, 750,function(){
				jQuery(this).addClass('locked');
			});
    	}
    }
    
    this.offer_unlock = function ( )
    {
    	// Signaling that the content has been unlocked
    	jQuery('.asset_holder').addClass('satellite');
    	
		if( true === jQuery('.asset_holder .btn-cta.show-survey').is(':visible') ){
			
			var url = '/resource-center/satellite/' + $utils.settings.post_id + '/unlock/?leadId=unlock'; // @GK to bust the cacher, include ?v'+Math.ceil(Math.random()*500000)
			jQuery.ajax({
				url      : url,
				dataType : 'JSON',
				method   : 'GET'
			}).done(function(data){
	        	// Keep the form hidden
	        	$utils.hide_marketo_form();
	        
				if ('html' == data.format) {
					$utils.unlock_html_via_satellite(data);
				} else if ( 'video' == data.format ) {
					$utils.unlock_video_via_satellite(data);
				} else if ( 'download' == data.format ) {
					$utils.unlock_download(data, false);
				}
			}).always(function(data) {
				if ('html' == data.format) {
					// After HTML unlocks
				} else if ( 'video' == data.format ) {
					// After Video unlocks
					jQuery('.play_frame').addClass('unlocked');
				} else if ( 'download' == data.format ) { 
					// After Download unlocks
				}
			});
		}
    };
	
    this.form_load = function ( e ) 
    {
        var _inputs       = jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .mktoFormRow .mktoFormCol .mktoField:not(select)'),
            _select       = jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .mktoFormRow select:not([type="checkbox"])'),
            _textarea     = jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .mktoFormRow textarea');

        // Selecting and adding a new class to the optin column
        jQuery("#gated [data-marketo-form-id='" + $utils.settings.gate_form_id + "'] input[type='checkbox'][name*='Optin']").closest('.mktoFormCol').addClass('mktoOptinCol');
        
        // Selecting .mktoFormRow's with just one hidden field and hiding the row
        jQuery("#gated [data-marketo-form-id='" + $utils.settings.gate_form_id + "'] input[type='hidden']:only-of-type").parent('.mktoFormRow').addClass('mktoHiddenCol');
        
        /* Apply Select Labels classes */
        jQuery.each( _select, function( i, val ) {
        	jQuery(this).siblings('label').addClass('select-label').parent('.mktoFieldWrap').addClass('selectFieldWrap');
        });
        	
        setTimeout(function() {
            _select.siblings('label').addClass('transform-instant select-label').parent('.mktoFieldWrap').addClass('selectFieldWrap');
            _textarea.siblings('label').addClass('label-focus');
        }, 200);
        
        // @GK Dep: _textarea.siblings('label').addClass('label-focus');
		
		/*
		 *  Reveal the form after a form reset
		 *  @since - v2.1.6
		 */
		 /* global URLSearchParams */
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
		
	    	if( urlParams.has('form-reset') && urlParams.has('form-type')){
	    		$utils.form_reset_url( urlParams );
	    	}
		
    	// - Debug
    	if( true === $utils.settings.debug ){
    		window.console.log('%c [DEBUG] ID:' + $utils.settings.gate_form_id + ' - Form loaded', 'background: #222; color: #bada55');
    	}
    };
    
    this.form_prefill = function (e) 
    {
    	var _prefilled;
    	/* Implementation */
		// - Get form ID
    		// Access the gate_form_id in utils `$utils.settings.gate_form_id`
		setTimeout(function(){ // [setTimeout:50]
		// - select form elements specific to gate_form_id
            var _inputs   = jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .mktoFormRow .mktoFormCol .mktoField'),
	            _select   = jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .mktoFormRow select'),
	            _textarea = jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .mktoFormRow textarea');
			// - overwrite phone number label copy
			// @GK Adding custom label text to phone, because Marketo won't allow me to change the label for that field.
    		var _phone = jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] #Phone');
    		// @GK Changing the Phone's label to be custom
    		_phone.siblings('label').html('<div class="mktoAsterix">*</div> PHONE NUMBER');
			// - Find prefilled inputs and give them a label of focus, when they aren't empty
			_prefilled = jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .mktoFormRow input, #gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] .mktoFormRow select').not('[type="checkbox"]').filter( function () { return !!this.value; } );
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
			// - $utils.attach_events_to_inputs(gate_form_id);
			// window.console.log('5A get gate form id - ' + $utils.settings.gate_form_id);
			$utils.attach_events_to_inputs( $utils.settings.gate_form_id );
			
			// - Add a change event to each select dropdown
			//	- @GK setTimeout because New fields may show up after a selection
	        jQuery.each( _select, function( i, val ) {
		        jQuery(this).on('change', function() {
		        	if( true === $utils.settings.debug ){
		        		window.console.log('%c [DEBUG] fired only once please! (' + i + ')', 'background: #222; color: #bada55');
		        	}
		            setTimeout(function(){ $utils.attach_events_to_inputs( $utils.settings.gate_form_id ); }, 75);
		        });
	        });
	        
            _select.on('change', function(){
            	setTimeout(function(){
	                _inputs       = jQuery('#gated [data-marketo-form-id="'+ $utils.settings.gate_form_id +'"] .mktoFormRow .mktoFormCol .mktoField'),
	                _select       = jQuery('#gated [data-marketo-form-id="'+ $utils.settings.gate_form_id +'"] .mktoFormRow select'),
	                _textarea     = jQuery('#gated [data-marketo-form-id="'+ $utils.settings.gate_form_id +'"] .mktoFormRow textarea');
	                        
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
						
						if ( !el.parents('#gated').length ) {
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
	        
			// - Give select fields a wrap class
            _select.siblings('label').addClass('transform-instant select-label').parent('.mktoFieldWrap').addClass('selectFieldWrap');
        
			jQuery("select[multiple]:not('.dom-select')").each(function(){
				var el = jQuery(this);
				
				// Restrict this to just the contact sales form
				if ( !el.parents('#gated').length ) {
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
			
		}, 50); // ./setTimeout
		
	   	// - Debug
    	if( true === $utils.settings.debug ){
    		window.console.log('%c [DEBUG] ID:' + $utils.settings.gate_form_id + ' - Form just got prefilled', 'background: #222; color: #bada55');
    	}
    };
    
    this.localize_prefill = function ()
    {
        let _src		= jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] input[name="Most_Recent_Source__c"]'),
        	_lsd		= jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] input[name="Most_Recent_Source_Detail__c"]'),
        	_cid		= jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] input[name="Most_Recent_Campaign__c"]'),
        	_r_name		= jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] input[name="Most_Recent_Resource__c"]'),
        	_r_type		= jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] input[name="Most_Recent_Resource_Type__c"]'),
        	_r_prim_topic = jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] input[name="Most_Recent_Resource_Topic__c"]'),
        	_r_product	= jQuery('#gated [data-marketo-form-id="' + $utils.settings.gate_form_id + '"] input[name="Most_Recent_Product__c"]');
			        
			        
	        if( '' != satellite_obj['cid'] || !window.localStorage.getItem("cid")){
	        	window.localStorage.setItem("cid", satellite_obj['cid']);
	        }
	        
	        if( 'website' != satellite_obj['src'] || !window.localStorage.getItem("src")){
	        	window.localStorage.setItem("src", satellite_obj['src']);
	        }
	        
	        if( 'organic' != satellite_obj['lsd'] || !window.localStorage.getItem("lsd")){
	        	window.localStorage.setItem("lsd", satellite_obj['lsd']);
	        }else if( 'organic' != satellite_obj['lsd'] && 'organic' == window.localStorage.getItem("lsd") ){
	        	window.localStorage.setItem("lsd", satellite_obj['lsd']);
	        }

        	_cid.attr('value', window.localStorage.getItem("cid") );
        	_src.attr('value', window.localStorage.getItem("src") );
        	_lsd.attr('value', window.localStorage.getItem("lsd") );
        	
        	// Get localized resource info
        	let _rw_name = satellite_obj['current_r_name'];
        		_rw_name = _rw_name.charAt(0).toUpperCase() + _rw_name.slice(1);
        	
    		_r_name.attr('value',		_rw_name );
    		_r_type.attr('value',		satellite_obj['current_r_type'] );
    		_r_prim_topic.attr('value', satellite_obj['current_r_primary_topic'] );
    		_r_product.attr('value',	satellite_obj['current_r_product'] );
        	
        	
        	if(jQuery('#codex_resourcegate').length){
	        	let lead_detail = { "Most_Recent_Source__c" : _src.attr('value') ,
									"Most_Recent_Source_Detail__c"  : _lsd.attr('value') ,
									"Most_Recent_Campaign__c"		: _cid.attr('value') ,
								  };
				jQuery('#codex_resourcegate .modal-body .lead-detail')
					.html( JSON.stringify(lead_detail).replace( /([{,])+/g,'$1<br />'+'&nbsp;'.repeat(5)).replace(/\"\}/g,'"<br/>}') );
				
				let resource_detail = { "Most_Recent_Resource__c"		: _r_name.attr('value') ,
										"Most_Recent_Resource_Type__c"	: _r_type.attr('value') ,
										"Most_Recent_Resource_Topic__c" : _r_prim_topic.attr('value') ,
										"Most_Recent_Product__c"		: _r_product.attr('value') ,
									  };
				jQuery('#codex_resourcegate .modal-body .resource-detail')
					.html( JSON.stringify(resource_detail).replace( /([{,])+/g,'$1<br />'+'&nbsp;'.repeat(5)).replace(/\"\}/g,'"<br/>}') );
				
				if( !_r_name.length ){
					jQuery('#codex_resourcegate .modal-body .resource-detail')
						.append(jQuery('<em>No Hidden fields found. Is this resource gated?</em>'));
				}
				
	        	jQuery('[data-bs-target="#codex_resourcegate"]').on('click',function(e){
		        	let lead_detail = { "Most_Recent_Source__c" : _src.attr('value') ,
										"Most_Recent_Source_Detail__c"  : _lsd.attr('value') ,
										"Most_Recent_Campaign__c"		: _cid.attr('value') ,
									  };
									  
					jQuery('#codex_resourcegate .modal-body .lead-detail')
						.html( JSON.stringify(lead_detail).replace( /([{,])+/g,'$1<br />'+'&nbsp;'.repeat(5)).replace(/\"\}/g,'"<br/>}') );
					
					let resource_detail = { "Most_Recent_Resource__c"		: _r_name.attr('value') ,
											"Most_Recent_Resource_Type__c"	: _r_type.attr('value') ,
											"Most_Recent_Resource_Topic__c" : _r_prim_topic.attr('value') ,
											"Most_Recent_Product__c"		: _r_product.attr('value') ,
										  };
										  
					jQuery('#codex_resourcegate .modal-body .resource-detail')
						.html( JSON.stringify(resource_detail).replace( /([{,])+/g,'$1<br />'+'&nbsp;'.repeat(5)).replace(/\"\}/g,'"<br/>}') );
						
					if( !_r_name.length ){
						jQuery('#codex_resourcegate .modal-body .resource-detail')
							.append(jQuery('<p><em>No Hidden fields found. Is this resource gated?</em></p>'));
					}
	        	});
        	}
    }
    
    this.update_localstorage = function (e){
    	/* global $satellite_modal_cb */
    	// Updating "nwea_resource" localstorage
		let update_nwea_resource = {
			"last_r_name"		   : satellite_obj['current_r_name'],
			"last_r_type"		   : satellite_obj['current_r_type'],
			"last_r_primary_topic" : satellite_obj['current_r_primary_topic'],
			"last_r_product"	   : satellite_obj['current_r_product'],
		};
		
		window.localStorage.setItem( "nwea_resource", JSON.stringify ( update_nwea_resource ) );
		
		if( 'object' == typeof($satellite_modal_cb) && 'function' == typeof($satellite_modal_cb.localize_prefill)){
			$satellite_modal_cb.localize_prefill();
		}
    }
    
    this.form_success = function (e)
    { 
		// Access the gate_form_id & lead_id in utils `$utils.settings.gate_form_id...`
    	$utils.hide_marketo_form( true );
        
		var url = '/resource-center/satellite/' + POST_ID + '/unlock/?leadId=' + $utils.settings.lead_id; // @GK to bust the cacher, include ?v'+Math.ceil(Math.random()*500000)
		jQuery.ajax({
			url      : url,
			dataType : 'JSON',
			method   : 'GET'
		}).done(function(data){
			if ('html' == data.format) {
				$utils.unlock_html_via_modal(data);
			} else if ( 'video' == data.format ) {
				$utils.unlock_video_via_modal(data, true);
			} else if ( 'download' == data.format ) {
				$utils.unlock_download(data, true);
			}
		});
	    
	    // - Debug
		if( true === $utils.settings.debug ){
    		window.console.log('%c [DEBUG] ID:' + $utils.settings.gate_form_id + ' - Form was submitted', 'background: #222; color: #bada55');
    	}
    };
    
    this.read_more = function () 
    {
		$utils.hide_marketo_form();
		
		var url = '/resource-center/satellite/' + $utils.settings.post_id + '/unlock/?leadId=unlock'; // @GK to bust the cacher, include ?v'+Math.ceil(Math.random()*500000)
		jQuery.ajax({
			url      : url,
			dataType : 'JSON',
			method   : 'GET'
		}).done(function(data){
			$utils.read_more_html(data);
		}).always(function(data) {
			// After HTML unlocks
		});	
    };
    
    this.play_video = function ()
    {
    	/* global Vimeo */
    	
		var url = '/resource-center/satellite/' + $utils.settings.post_id + '/unlock/?leadId=unlock'; // @GK to bust the cacher, include ?v'+Math.ceil(Math.random()*500000)
		
		jQuery.ajax({
			url      : url,
			dataType : 'JSON',
			method   : 'GET'
		}).done(function(data){
			var videodiv = jQuery('.embed_container'),
				el = data['video-embed'];
		
			videodiv.animate({'opacity':0}, 'fast',function(){
				jQuery(this).empty()
					   .append("<div class='play_frame'></div>");
				jQuery('.embed_container .play_frame').append(el);
	
				jQuery('.play_frame').css('opacity',0).animate({'opacity':1}, 750,function(){
					jQuery(this).addClass('locked');
				});
	
				jQuery(this).delay(300)
					   .animate({opacity: 1});
				}).fadeIn('slow',function(){
					var iframe = document.querySelector('.play_frame iframe'); 
					$utils.player = new Vimeo.Player(iframe);
					$utils.player.play();
				});
		});
    };

    this.construct(options);
};

// *Gate Callback Constructor
var $gate_cb = new GateCallback();

var offer_unlock = function(){
	if( true === $utils.settings.debug ){
		window.console.log('%c [DEBUG] Offer Is Unlocking' , 'background: #222; color: #bada55');
	}
	if ( typeof $gate_cb === 'object' ) {
		if( true === $utils.settings.debug ){
			window.console.log('%c [DEBUG] Unlocking offer' , 'background: #222; color: #bada55');
		}
    	$gate_cb.offer_unlock();
	}
};

var offer_lock = function(){
	if( true === $utils.settings.debug ){
		window.console.log('%c [DEBUG] Offer may be locked' , 'background: #222; color: #bada55');
	}
	
	if ( typeof $gate_cb === 'object' ) {
		if( true === $utils.settings.debug ){
			window.console.log('%c [DEBUG] Locking offer' , 'background: #222; color: #bada55');
		}
    	$gate_cb.offer_lock();
	}
};

var allowable_resource = function (){
	$utils = new GateUtil({
		container	: jQuery('.maincol .asset_holder'),
		post_id 	: POST_ID,
		debug		: false
	});
}

function gated_content_form_load(load_gate_form_id, closeMethod, theTimeout = 3500, openFileDelay = 1000){
	/* global POST_ID jQuery */
	window.addEventListener( 'marketo_form_load', function ( e ) {
		if( parseInt(load_gate_form_id) == parseInt( e.detail.form_id ) ){
			// Set up GateUtil class with form details
			$utils = new GateUtil({
				container   : jQuery('.maincol .asset_holder'),
				gate_form_id : parseInt(load_gate_form_id), // parseInt( e.detail.form_id ),
				post_id 	: POST_ID,
				closeMethod : closeMethod,
				theTimeout	: theTimeout,
				openFileDelay : openFileDelay,
				debug		: false,
			});
			
			if( true === $utils.settings.debug ){
				window.console.log('%c [DEBUG:Gate] JS just found ' + e.detail.form_id , 'background: #222; color: #bada55');
				window.console.log('%c [DEBUG:Gate] Initialised $utils' , 'background: #222; color: #bada55');
			}
			
			$gate_cb.form_load();
		}
	} );
	
	window.addEventListener( 'marketo_form_prefill', function ( e ) {
		if( parseInt(load_gate_form_id) == parseInt( e.detail.form_id ) ){
			if( true === $utils.settings.debug ){
				window.console.log('%c [DEBUG:Gate] marketo_form_prefill - ' + load_gate_form_id, 'background: #222; color: #bada55');
			}
			
			setTimeout(function(){
				$gate_cb.form_prefill();
				if( typeof satellite_obj !== 'undefined' ){
					$gate_cb.localize_prefill();
				}
			}, 500);
		}
	});
	
	window.addEventListener( 'marketo_form_success', function ( e ) {
		if( parseInt(load_gate_form_id) == parseInt( e.detail.form_id ) ){
		    // Merge $util.settings with new lead_id
		    jQuery.extend( $utils.settings, { lead_id : parseInt( e.detail.lead_id ) } );
		    
			if( true === $utils.settings.debug ){
	    		window.console.log('%c [DEBUG:Gate] Lead ID :' + $utils.settings.lead_id + ' - Lead ID retrieved', 'background: #222; color: #bada55');
	    	}
	    	
			$gate_cb.form_success();
			$gate_cb.update_localstorage();
		}
	} );
	
	window.addEventListener('load', function ( e ) {
		// Page is fully loaded
		var form_context = jQuery('#gated');
		
		if (typeof MktoForms2 === 'undefined') {
		  form_context.addClass('not_loaded');
		}
	} );
}

(function() {
	var safetyTimer = setInterval(safetySwitch, 3000);
	
	function safetySwitch(){
		// $utils.lock_debug();
		if ( $utils ){
			clearInterval(safetyTimer);
			$utils.time_to_lck();
		}else{
			window.console.log('%c [DEBUG:Gate] Validating lock again in 3 seconds', 'background: #fbdd79; color: #414142');
		}
	}
})();
