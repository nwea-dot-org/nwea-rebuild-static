/* global $ jQuery location history change */
/* Research Library */
(function($) {
	
	var nweaDebug = function(msg){
		// window.console.log('%c [DEBUG] ' + msg, 'background: #222; color: #bada55');	
	};
	
	var Filter = function(options){
		
		var vars = {};
		var root = this;
		
		// @GK TODO get newest URL from object instead of the DOM
		var filterVal;
	    
		this.construct = function( options )
		{
			// As in the example to setting up a constructor
	        $.extend(vars , options);
	    };
	    
	    this.setFilterVal = function(val)
	    {
	    	this.filterVal = val;
	    };
	    
	    this.getFilterVal = function(val)
	    {
	    	return this.filterVal;
	    };
	    
		this.make_url_JSON = function( selected )
		{
			var url = '/research/filter/' + selected.research_topic + '/' + selected.researcher + '/' + selected.research_type + '/' + selected.research_center + '/' + selected.research_product + '/';
		
			$('.filter-container').val(url);
			root.setFilterVal( url );
			
			root.gather_posts(url);
		};
		
	    this.scroll_top_filter = function()
	    {
			$([document.documentElement, document.body]).animate({
		      scrollTop: $(".filter-container").offset().top - 50
		    }, 1000, 'easeInOutQuint');
		};
	
		this.ajax_chip_data = function( data )
		{
			var el = $('<ul />', {
				class: 'list-unstyled' 
			});
			
			var close_icon = $('<i />', {
				class: 'fa fa-times-circle'
			});
			
			$.each(data['chip'],function(k,v){
				
				// Conditional check for research center overview
				var research_center_attr = $('.filter-container').attr('data-research-center');
				if (typeof research_center_attr !== typeof undefined && research_center_attr !== false) {
					if(v.filter == 'research_center'){
						// Continue a each loop by returning a non false value
						return true;
					}
				}else{
					// Do nothing!
				}
				
				if(v.name != null){
					$('<div>',{
						text: v.name.replace( /\&amp;/g, '&' ),
						'data-remove-filter' : v.filter,
						'data-remove-target' : v.slug,
						class: 'chip active '+ v.filter
					})
						.wrapInner( "<span />")
						.append( close_icon.clone() )
						.wrap('<li>').parent()
						.appendTo(el);
				}
			});
			
			$('.row.chip-wrap').children('ul').fadeOut( 25, function(){
				$(this).remove();
				// @GK going away from fading el.hide().appendTo('.row.chip-wrap').delay(250).fadeIn(100);
				el.hide().appendTo('.row.chip-wrap').show();
			});
		};
	
		this.remove_chip = function( remove )
		{
			$('a[data-option="'+remove.target+'"]').trigger('click');
			
			var containerVal = $('.filter-container').val();

			// @GK TODO (this should be the preferred method) var containerVal = this.getFilterVal();
			
			var newURL = containerVal
							.replace(remove.target, '')
							.replace('//','/all/')
							.replace('/,','/')
							.replace(',/','/')
							.replace(',,',',');
			
			$('.filter-container').val(newURL);

			root.setFilterVal( newURL );
			
			root.gather_posts( newURL );
		};
		
		this.ajax_assets_data = function( data )
		{

			var pages = Math.ceil( data['count'] / 7 );
			
			if( data['p'].length === 0 && data['paged'] > 1 && data['paged'] > pages ) {
				var newURL = $('.filter-container').val().split('page/')[0] + 'page/' + pages;
				
				$('.filter-container').val(newURL);
				
				this.setFilterVal( newURL );
				root.gather_posts(newURL);
				
				$('.table.related > .tbody').empty();
			
				return false;
			}
			
			$('.table.related > .tbody').empty();
			
			if( data['p'].length === 0 ){

				var item_wrap = $('<div />',{class:'tr row tbody'});
				
				var txt_title	= $("<span>", {
									text: "No Results Found",
									title: "No Results Found"
								  }).wrap('<h4 />').parent();
				
				var imgcol	= $( $('<div />') ).wrap('<div class="cell-wrap" />').parent().wrap('<div class="td col-img d-none d-lg-block" />').parent();
				// For the responsiveness layout, 
				// use imgrow in the text column
				var imgrow	  = $( $('<div />') ).wrap('<div class="imgrow d-block d-lg-none" />').parent();
				
				var txtcol = $('<div />',{class: 'cell-wrap'})
								.append( imgrow )
								.append( txt_title )
								.wrap('<div class="td col-txt">').parent();
				var datecol	= $('<span />', {
									class: 'date',
									text: '',
							  })
								.wrap('<div class="cell-wrap" />').parent()
								.wrap('<div class="td col-date" />').parent();
				
				var tbody = item_wrap.append(imgcol).append(txtcol).append(datecol);
				
				// $('.results_feed .wrap').append(el).fadeIn(450);
				$('.table.related > .tbody').append(tbody);
				return false;
			} 
			
			
			$.each(data['p'], function(k,v){
	
				var item_wrap = $('<div />',{class:'tr row tbody'});
				
				var txt_type	= $('<span />',{ 
									text: v.type,
									class:'asset-type plus',
								  });
				var txt_title	= $("<a>", {
									text: $('<div />').html(v.title).text(),
									title: $('<div />').html(v.title).text(),
									href: v.permalink,
								  }).wrap('<p class="publication-title fs-base fw-500" />').parent();
				var txt_description = $('<div />', {
					class: 'search-description line-clamp-3' 
				}).html(v.description);
				
				if( 'media mention' === v.type.toLowerCase() ){
					if ( '' != v.authors ){
						var txt_authors = $('<p />',{class: 'author'}).html('Mentions: ' + v.authors);
					}
					if ( '' != v.src && 'undefined' !== typeof v.src ){
						var txt_source = $('<div />',{class: 'source'}).html('Source: ' + v.src);
					}
				} else if ( 'book' === v.type.toLowerCase() ){
					if ( '' != v.authors_prefix ){
						var txt_authors = $('<p />',{class: 'author'}).html( v.authors_prefix + ' ' + v.authors );
					} else {
						var txt_authors = $('<p />',{class: 'author'}).html('By: ' + v.authors);
					}
				}else{
					var txt_authors = $('<p />',{class: 'author'}).html('By: ' + v.authors);
				}
				
				var txt_topics	 = $('<p />',{class: 'topics'}).html('Topics: ' + v.topics);
				if(  null != v.products ){
					var txt_products = $('<p />',{class: 'products'}).html('Products: ' + v.products);
				}
				var imgcol		 = $( v.thumb ).wrap('<div class="cell-wrap" />').parent().wrap('<div class="td col-img d-none d-lg-block" />').parent();
				
				// For the responsiveness layout, 
				// use imgrow in the text column
				var imgrow	  = $( v.thumb ).wrap('<div class="imgrow d-block d-lg-none" />').parent();
				
				var txtcol = $('<div />',{class: 'cell-wrap'})
								.append( imgrow )
								.append( txt_type )
								.append( txt_title )
								.append( txt_description )
								.append( txt_topics )
								.wrap('<div class="td col-txt">').parent();
				if( 'media mention' === v.type.toLowerCase() && 'undefined' !== typeof txt_source ){
					txtcol.find('.topics').before( txt_source );
				}
				if(  null != v.authors && '' != v.authors ){
					txtcol.find('.topics').before( txt_authors );
				}
				if(  null != v.products && '' != v.products ){
					txtcol.find('.topics').before( txt_products );
				}

				var datecol	= $('<span />', {
									class: 'date',
									text: v.date,
							  })
								.wrap('<div class="cell-wrap" />').parent()
								.wrap('<div class="td col-date" />').parent();
				
				var tbody = item_wrap.append(imgcol).append(txtcol).append(datecol);
				
				// $('.results_feed .wrap').append(el).fadeIn(450);
				$('.table.related > .tbody').append(tbody);
			});
		
		};
	
		this.ajax_pagination_data = function( data )
		{
			$('#pagination').empty();
	
			if( data['count'] < 7 ){
				// @GK Do Nothing!	
			}else{
				// @GK Get number of pages
				var pages = Math.ceil( data['count'] / 7 );
				
				// @GK place the page count as the new val for pagination to return # of pages later
				$('#pagination').val(pages);
				
				// @GK Add the prev page link to the pagination
				if(  pages >= 2 && data['paged'] > 1  ){
					$('<a />',{
						class: 'prev page-numbers',
						'data-paginate-action': 'prev',
						text: '‹',
						href: "#",
						onclick: 'return false;',
					}).appendTo('#pagination');
				}
				
				// @GK Set the first page as active and create page-numbers
				// @GK New as of v2.1.7....show top page # in the list
				if(  pages <= 5 ){
					for(var $i = 1; $i <= pages && $i <= 5 ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						pageLink.appendTo('#pagination');
					}
				} else if ( pages > 5 && data['paged'] > 2  ) {
					// Quick way to show the middle pages.
					for(var $i = 1; $i <= pages ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						if( $i == pages - 1 && data['paged'] < pages - 2 ){
							var endPageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
							
							endPageLink.appendTo('#pagination');
						}else if ( $i == pages ){ 
							pageLink.appendTo('#pagination');
						} else if ( $i == 1 || ( $i > data['paged'] - 3 && $i < data['paged'] + 2 ) ){
							pageLink.appendTo('#pagination');
						}
						
						if( $i == 1 && data['paged'] > 4 ){
							var pageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
						}
						
					}
				} else {
					for(var $i = 1; $i <= pages ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						if( $i == 4 ){
							var pageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
						}else if( $i == pages ) {
							pageLink.appendTo('#pagination');
						}else if( $i < 4 ){
							pageLink.appendTo('#pagination');
						}
					}
				}
	
				// @GK Add the next page link to the pagination...
				// @GK New as of v2.1.7... if the total num. pages is greater than the page
				if(  pages >= data['paged'] + 1 && data['paged'] < pages  ){
					$('<a />',{
						class: 'next page-numbers',
						'data-paginate-action': 'next',
						text: '›',
						href: "#",
						onclick: 'return false;',
					}).appendTo('#pagination');
				}else{
					// Do Nothing
				}
					

			}
		};
	
		/**
		 * Gather and process results for the filter
		 * - Updates window url with new filter parameters
		 * - Excludes window url history update on research center view
		 * @param  {String} url 
		 * @since  v2.0
		 */
	    this.gather_posts = function( url )
	    {
			$('.table.assets .tbody, #pagination').animate({
		      opacity: .35
		    }, 500);
		    
		    $('.maincol .topic-wrap').animate({
		      opacity: .55
		    }, 500);
		    
			$.ajax({
				url: url,
				dataType: 'JSON'
			}).done(function( data ) {
				setTimeout(function(){
					$('.maincol .topic-wrap, .table.assets .tbody, #pagination').animate({
				      opacity: 1
				    }, 500);
				    
					// @GK Reveal the clear button
					if( $('.chip.active').length >= 1 ){
						$('.reset.btn-clear').removeClass('d-none');
					}else{
						$('.reset.btn-clear').addClass('d-none');
					}
				},350);
				
				
				root.ajax_chip_data(data);
				
				// @Since v2.1.6 Conditional check for research center overview
				var research_center_attr = $('.filter-container').attr('data-research-center');
				if (typeof research_center_attr !== typeof undefined && research_center_attr !== false) {
					// Do not rewrite history (URL address)
				}else{
					// @GK Had trouble getting back button to work properly
					var $hash = "/" + "research/all-research/";
					window.history.replaceState({}, document.title, $hash);
					// window.console.log( data );
					if( data['topic'] ){
						root.apply_topic( data['topic'] );
						$hash = "/" + "research/theme/" + data['topic']['slug'];
						window.history.replaceState({}, document.title, $hash );
					} else if ( data['type'] ) {
						root.apply_topic( data['type'] );
						$hash =  "/" + "research/type/" + data['type']['slug'];
						window.history.replaceState({}, document.title, $hash );
					} else if( data['product'] ){
						root.apply_topic( data['product'] );
						$hash = "/" + "research/product/" + data['product']['slug'];
						window.history.replaceState({}, document.title, $hash );
					} else {
						root.hide_topic();
					}
				}
				
				root.ajax_assets_data(data);
				
				root.ajax_pagination_data(data);
				
			}).always(function(data){ /* Always run this code */  });
			
		};
	
		this.prev_filter_page = function()
		{
			var current = $('#pagination .page-numbers.current').data('paginate-page');
			
			if(current > 1){
				$('#pagination .page-numbers.current').removeClass('current');
			
				var newURL = $('.filter-container').val().split('page/')[0] + 'page/' + ( current - 1 );
				$('.filter-container').val(newURL);
				this.setFilterVal( newURL );
			
				$('#pagination .page-numbers[data-paginate-page=' + ( current - 1 ) + ']').addClass('current');
			
				root.gather_posts(newURL);
				root.scroll_top_filter();
			}
		};
	
		this.next_filter_page = function()
		{
			var current = $('#pagination .page-numbers.current').data('paginate-page');

			$('#pagination .page-numbers.current').removeClass('current');
		
			var newURL = $('.filter-container').val().split('page/')[0] + 'page/' + ( current + 1 );
			
			$('.filter-container').val(newURL);
			this.setFilterVal( newURL );
		
			$('#pagination .page-numbers[data-paginate-page=' + ( current + 1 ) + ']').addClass('current');

			root.gather_posts(newURL);
			root.scroll_top_filter();
		};
		
		// @GK TODO this function name is too similar to the research_theme/topics schema.
		// It is updating the filter singular chip's intro paragraph 
		this.apply_topic = function( topic )
		{
			$('.maincol .topic-wrap').removeClass('empty');
			$('.maincol .topic-wrap .topic-title').html( topic.name ).fadeIn();
			$('.maincol .topic-wrap .topic-description').html( topic.description ).fadeIn();
			$('.bannerwrap').html( topic.banner );
		};
		
		this.hide_topic = function()
		{
			$('.maincol .topic-wrap .topic-title').fadeOut(function(){$(this).empty()});
			$('.maincol .topic-wrap .topic-description').fadeOut(function(){$(this).empty()});
			$('.maincol .topic-wrap').addClass('empty');
		};
		
		this.clear_results = function()
		{
			// The submit button is inside a chip-wrap also, so I specified .row.chip-wrap for chips.
			$('.row.chip-wrap').children().fadeOut('200',function(){
				$(this).empty();
			});
			
			$('.dropdown-menu').each(function(){
				$(this).val('');
			});
			
			$('.dropdown ul li.active').each(function(){
				$(this).removeClass('active');
			})
			
			$('.filter-container .btncol .btn-submit').trigger('click'); // @GK this fn can be improved
		};
		
		this.single_gather_url_JSON = function( selected )
		{
			var url = '/research/filter/' + selected.research_topic + '/' + selected.researcher + '/' + selected.research_type + '/' + selected.research_center + '/' + selected.research_product + '/';
		
			$('#related-research').val(url);
			
			return url;
		};
		
		this.single_ajax_assets_data = function( data )
		{
			
			var pages = Math.ceil( data['count'] / 7 );
			
			if( data['p'].length === 0 && data['paged'] > 1 && data['paged'] > pages ) {
				var newURL = $('#related-research').val().split('page/')[0] + 'page/' + pages;
				
				$('#related-research').val(newURL);
				
				root.single_gather_posts(newURL);
				
				$('.table.related > .tbody').empty();
			
				return false;
			}
			
			$('.table.related > .tbody').empty();
			
			if( data['p'].length === 0 ){
				var item_wrap = $('<div />',{class:'tr row tbody'});
				

				var txt_title	= $("<span>", {
									text: "No Results Found",
									title: "No Results Found"
								  }).wrap('<h4 />').parent();
				
				var imgcol	= $( $('<div />') ).wrap('<div class="cell-wrap" />').parent().wrap('<div class="td col-img d-none d-lg-block" />').parent();
				// For the responsiveness layout, 
				// use imgrow in the text column
				var imgrow	  = $( $('<div />') ).wrap('<div class="imgrow d-block d-lg-none" />').parent();
				
				var txtcol = $('<div />',{class: 'cell-wrap'})
								.append( imgrow )
								.append( txt_title )
								.wrap('<div class="td col-txt">').parent();
				var datecol	= $('<span />', {
									class: 'date',
									text: '',
							  })
								.wrap('<div class="cell-wrap" />').parent()
								.wrap('<div class="td col-date" />').parent();
				
				var tbody = item_wrap.append(imgcol).append(txtcol).append(datecol);
				
				// $('.results_feed .wrap').append(el).fadeIn(450);
				$('.table.related > .tbody').append(tbody);
				return false;
			} 
			
			
			$.each(data['p'], function(k,v){
	
				var item_wrap = $('<div />',{class:'tr row tbody'});
				
				var txt_type	= $('<span />',{ 
									text: v.type,
									class:'asset-type plus',
								  });
								  
				var txt_title	= $("<a>", {
									text: $('<div />').html(v.title).text(),
									title: $('<div />').html(v.title).text(),
									href: v.permalink,
								  }).wrap('<p class="publication-title fs-base fw-500" />').parent();
								  
				var txt_description = $('<div />', {
					class: 'search-description line-clamp-3' 
				}).html(v.description);
				
				if( 'media mention' === v.type.toLowerCase() ){
					if ( '' != v.authors ){
						var txt_authors = $('<p />',{class: 'author'}).html('Mentions: ' + v.authors);
					}
					if ( '' != v.src && 'undefined' !== typeof v.src ){
						var txt_source = $('<div />',{class: 'source'}).html('Source: ' + v.src);
					}
				} else if ( 'book' === v.type.toLowerCase() ){
					if ( '' != v.authors_prefix ){
						var txt_authors = $('<p />',{class: 'author'}).html( v.authors_prefix + ' ' + v.authors );
					} else {
						var txt_authors = $('<p />',{class: 'author'}).html('By: ' + v.authors);
					}
				}else{
					var txt_authors = $('<p />',{class: 'author'}).html('By: ' + v.authors);
				}
				
				var txt_topics	 = $('<p />',{class: 'topics'}).html('Topics: ' + v.topics);
				if(  null != v.products ){
					var txt_products = $('<p />',{class: 'products'}).html('Products: ' + v.products);
				}
				var imgcol		 = $( v.thumb ).wrap('<div class="cell-wrap" />').parent().wrap('<div class="td col-img d-none d-lg-block" />').parent();
				
				// For the responsiveness layout, 
				// use imgrow in the text column
				var imgrow	  = $( v.thumb ).wrap('<div class="imgrow d-block d-lg-none" />').parent();
				
				var txtcol = $('<div />',{class: 'cell-wrap'})
								.append( imgrow )
								.append( txt_type )
								.append( txt_title )
								.append( txt_description )
								.append( txt_topics )
								.wrap('<div class="td col-txt">').parent();
				if( 'media mention' === v.type.toLowerCase() && 'undefined' !== typeof txt_source ){
					txtcol.find('.topics').before( txt_source );
				}
				if(  null != v.authors && '' != v.authors ){
					txtcol.find('.topics').before( txt_authors );
				}
				if(  null != v.products && '' != v.products ){
					txtcol.find('.topics').before( txt_products );
				}

				var datecol	= $('<span />', {
									class: 'date',
									text: v.date,
							  })
								.wrap('<div class="cell-wrap" />').parent()
								.wrap('<div class="td col-date" />').parent();
				
				var tbody = item_wrap.append(imgcol).append(txtcol).append(datecol);
				
				// $('.results_feed .wrap').append(el).fadeIn(450);
				$('.table.related > .tbody').append(tbody);
			});
		
		};
	
		this.single_ajax_pagination_data = function( data )
		{
			$('#pagination').empty();
	
			if( data['count'] < 7 ){
				// @GK Do Nothing!	
			}else{
				// @GK Get number of pages
				var pages = Math.ceil( data['count'] / 7 );
				
				// @GK place the page count as the new val for pagination to return # of pages later
				$('#pagination').val(pages);
				
				// @GK Add the prev page link to the pagination
				if(  pages >= 2 && data['paged'] > 1  ){
					$('<a />',{
						class: 'prev page-numbers',
						'data-paginate-action': 'prev',
						text: '‹',
						href: "#",
						onclick: 'return false;',
					}).appendTo('#pagination');
				}
				
				// @GK Set the first page as active and create page-numbers
				// @GK New as of v2.1.7....show top page # in the list
				if(  pages <= 5 ){
					for(var $i = 1; $i <= pages && $i <= 5 ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						pageLink.appendTo('#pagination');
					}
				} else if ( pages > 5 && data['paged'] > 2  ) {
					// Quick way to show the middle pages.
					for(var $i = 1; $i <= pages ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						if( $i == pages - 1 && data['paged'] < pages - 2 ){
							var endPageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
							
							endPageLink.appendTo('#pagination');
						}else if ( $i == pages ){ 
							pageLink.appendTo('#pagination');
						} else if ( $i == 1 || ( $i > data['paged'] - 3 && $i < data['paged'] + 2 ) ){
							pageLink.appendTo('#pagination');
						}
						
						if( $i == 1 && data['paged'] > 4 ){
							var pageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
						}
						
					}
				} else {
					for(var $i = 1; $i <= pages ; $i++ )
					{
						var pageLink = $('<a />',{
							class: 'page-numbers',
							'data-paginate-page': $i,
							text: $i,
							href: "#",
							onclick: 'return false;',
						}); 
						
						if( $i == data['paged'] ){
							pageLink.addClass('current');
						}
						
						if( $i == 4 ){
							var pageLink = $('<span />',{
								class: 'page-numbers dots',
								text: '…',
								href: "#",
								onclick: 'return false;',
							}).appendTo('#pagination');
						}else if( $i == pages ) {
							pageLink.appendTo('#pagination');
						}else if( $i < 4 ){
							pageLink.appendTo('#pagination');
						}
					}
				}
	
				// @GK Add the next page link to the pagination...
				// @GK New as of v2.1.7... if the total num. pages is greater than the page
				if(  pages >= data['paged'] + 1 && data['paged'] < pages  ){
					$('<a />',{
						class: 'next page-numbers',
						'data-paginate-action': 'next',
						text: '›',
						href: "#",
						onclick: 'return false;',
					}).appendTo('#pagination');
				}else{
					// Do Nothing
				}
					

			}
		};
		
	    this.single_gather_posts = function( url )
	    {
			if( 'ASC' == $('#related-research').data('order') ){
				url = url + '?order=reversed';
			}
	    	
			$('.table.assets .tbody, #pagination').animate({
		      opacity: .35
		    }, 500);
		    
		    $('.maincol .topic-wrap').animate({
		      opacity: .55
		    }, 500);
		    
			$.ajax({
				url: url,
				dataType: 'JSON'
			}).done(function( data ) {
				setTimeout(function(){
					$('.maincol .topic-wrap, .table.assets .tbody, #pagination').animate({
				      opacity: 1
				    }, 500);
				},350);

				root.single_ajax_assets_data(data);
				
				root.single_ajax_pagination_data(data);
				
			}).always(function(data){ /* Always run this code */  });
			
			return root.gather;
		};
		
	    this.single_init_pagination = function( url )
	    {
			$.ajax({
				url: url,
				dataType: 'JSON'
			}).done(function( data ) {
				root.single_ajax_pagination_data(data);
			}).always(function(data){ /* Always run this code */  });
		};

		this.single_prev_filter_page = function()
		{
			var current = $('#pagination .page-numbers.current').data('paginate-page');
			
			if(current > 1){
				$('#pagination .page-numbers.current').removeClass('current');
			
				var newURL = $('#related-research').val().split('page/')[0] + 'page/' + ( current - 1 );
				$('#related-research').val(newURL);
				this.setFilterVal( newURL );
			
				$('#pagination .page-numbers[data-paginate-page=' + ( current - 1 ) + ']').addClass('current');
			
				root.gather_posts(newURL);
				root.scroll_top_filter();
			}
		};
	
		this.single_next_filter_page = function()
		{
			var current = $('#pagination .page-numbers.current').data('paginate-page');

			$('#pagination .page-numbers.current').removeClass('current');
		
			var newURL = $('#related-research').val().split('page/')[0] + 'page/' + ( current + 1 );
			
			$('#related-research').val(newURL);
			this.setFilterVal( newURL );
		
			$('#pagination .page-numbers[data-paginate-page=' + ( current + 1 ) + ']').addClass('current');

			root.gather_posts(newURL);
			root.scroll_top_filter();
		};

	    this.single_scroll_top_publication = function()
	    {
			$([document.documentElement, document.body]).animate({
		      scrollTop: $("#related-research").offset().top - 95
		    }, 1000, 'easeInOutQuint');
		};
	
		this.construct(options);
	};

	/* *~*~*~*~*~*~*~*~*~*~*~*~*  */
	/*  *~ Filter Constructor ~*  */
	var $filter = new Filter();
	/* *~*~*~*~*~*~*~*~*~*~*~*~*  */
	
	$(document).ready( function(){
		// Do Not Show on single assets.
		// Intended to only show on filter pages with pagination
		if ( !$('body').hasClass('single-publication') ) {
			
			$(document).on('click','.results_feed span',function(){
				var filter = $(this).data('remove-filter');
				var term = $(this).data('remove-target');
				
				$('#data-bs-target-' + filter + ' item[data-option="all"]').trigger('click');
			});
			
			$(document).on('click','.btncol .btn-clear',function(){
				$filter.clear_results();
			})
			
			$(document).on('click','.dropdown a[data-option]',function(e){
				e.preventDefault();
				// @Allowing for multiple selections - $(this).parent().siblings().removeClass('active');
				var i = 0;
				var this_dropdown = $(this).parent().parent();
				$(this).parent().toggleClass('active');
				
				$(this).parent('li').parent('ul').children('li.active').each(function(){
					// Ternary statement for adding ","\'s between terms if more than one term
					this_dropdown.val(  ( i < 1 ? '' : this_dropdown.val() + ',' ) + $(this).find('a').data('option') );
					i++;
				});
				
				if(i === 0)
				{
					// Clear values for this dropdown
					this_dropdown.val('');
				}
				
				// @DEBUG ONLY
				// @GK Show what was stored as selected, for debugging
				this_dropdown.attr('data-select', this_dropdown.val() );
				
				$('.dropdown.research-theme').on('classChange', function () {
				  if($(this).hasClass('open')){
				  	// console.log('not yet');
				  }else{
					// console.log('now an event has occured!');
				  }
				});
				return false;
			});
			
			// @GK - Timeout so that the event can bind after dropdown events are initiated
			setTimeout(function()
			{
				var $selected_count, $dropdown_overlay;
				var $container_state = {};
				$('.filter-row .dropdown').on('show.bs.dropdown', function() {
				  // show
				  $dropdown_overlay = $('<div />',{class:'dropdown_overlay active_overlay'});
				  
				  $container_state.theme 	  = $('.dropdown.research-theme ul').val();
				  $container_state.researcher = $('.dropdown.researcher ul').val();
				  $container_state.type 	  = $('.dropdown.research-type ul').val();
				  $container_state.center 	  = $('.dropdown.research-center ul').val();
				  $container_state.product 	  = $('.dropdown.research-product ul').val();
				}).on('shown.bs.dropdown', function() {
				  // shown
				  $('body').prepend($dropdown_overlay);
				}).on('hide.bs.dropdown', function() {
				  // hide
				  if(	 $container_state.theme 	 != $('.dropdown.research-theme ul').val() 
					  || $container_state.researcher != $('.dropdown.researcher ul').val()
					  || $container_state.type		 != $('.dropdown.research-type ul').val()
					  || $container_state.center	 != $('.dropdown.research-center ul').val()
					  || $container_state.product	 != $('.dropdown.research-product ul').val()) {
						$('.filter-container .btncol .btn-submit').trigger('click');
				  }
				}).on('hidden.bs.dropdown', function() {
				  // hidden
				  $dropdown_overlay.fadeOut('fast',function(){
				  	$(this).remove();
				  });
				});
			},500)
		
			$(document).on('click','.filter-container .btncol .btn-submit',function(e)
			{
				e.preventDefault();
		
				var selected = {}; 
					selected.research_topic 	= $('.dropdown.research-theme ul').val()	|| 'all';
					selected.researcher 		= $('.dropdown.researcher ul').val()		|| 'all';
					selected.research_type		= $('.dropdown.research-type ul').val() 	|| 'all';
					selected.research_product	= $('.dropdown.research-product ul').val() 	|| 'all';
				// Conditional check for research center overview
				var research_center_attr = $('.filter-container').attr('data-research-center');
				if (typeof research_center_attr !== typeof undefined && research_center_attr !== false) {
					selected.research_center	= $('.filter-container').attr('data-research-center');
				}else{
					selected.research_center	= $('.dropdown.research-center ul').val()	|| 'all';
				}
				
				// Hide the dropdown that may be open
				$('[data-bs-toggle="dropdown"]').parent().removeClass('open');
				
				$filter.make_url_JSON( selected );
		
				return false;	
			});
			
			$(document).on('click','.chip.active',function(e){
				e.preventDefault();
				
				var remove = {};
				
				remove.filter = $(this).data('remove-filter');
				remove.target = $(this).data('remove-target');
				
				$filter.remove_chip(remove);
				
				return false;
			});
			
			$(document).on('click','.page-numbers[data-paginate-page]',function(e){
				e.preventDefault();
				
				var newPage = $(this).data('paginate-page');
		
				var newURL = $('.filter-container').val().split('page/')[0] + 'page/' + newPage;
				$('.filter-container').val(newURL);
				$filter.setFilterVal( newURL );
				
				$(this).siblings().removeClass('current');
				$(this).addClass('current');
				
				$filter.gather_posts(newURL);
		        $filter.scroll_top_filter();
		      
				return false;
			});
			
			$(document).on('click','.page-numbers[data-paginate-action]',function(e){
				e.preventDefault();
				
				var action = $(this).data('paginate-action');
				
				if( action === 'prev' ){
					$filter.prev_filter_page();
				}else{
					$filter.next_filter_page();
				}
		
				return false;
			});
		}
		
		if ( $('body').hasClass('single-publication') ) {

			// Single Publication Pagination
			var selected = {}; 
				selected.research_topic   = $('#related-research').data('topics') || 'all' ;
				selected.researcher		  = 'all';
				selected.research_type	  = 'all';
				selected.research_center  = 'all';
				selected.research_product = 'all';

			var url = $filter.single_gather_url_JSON( selected );
				
			$filter.single_init_pagination(url);
			
			$(document).on('click','.page-numbers[data-paginate-page]',function(e){
				e.preventDefault();
				
				var newPage = $(this).data('paginate-page');
					nweaDebug('Related Resources Val');
					nweaDebug($('#related-research').val());
				
				var newURL = $('#related-research').val().split('page/')[0] + 'page/' + newPage;

				$('#related-research').val(newURL);
				
				nweaDebug('newURL');
				nweaDebug($('#related-research').val(newURL));

				$filter.setFilterVal( newURL );
				
				$(this).siblings().removeClass('current');
				$(this).addClass('current');
				
				$filter.single_gather_posts(newURL);
		        $filter.single_scroll_top_publication();
		      
				return false;
			});
				
			$(document).on('click','.page-numbers[data-paginate-action]',function(e){
				e.preventDefault();
				
				var action = $(this).data('paginate-action');
				
				if( action === 'prev' ){
					$filter.single_prev_filter_page();
				}else{
					$filter.single_next_filter_page();
				}
		
				return false;
			});
		}
	});

	$(document).ready(function(){
		$('.filter-container .btncol .btn-submit').trigger('click');
	})
	
	/* *~*~*~*~*~*~*~*~*~* */
})(jQuery);
