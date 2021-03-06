$(document).ready(function(){
	"use strict";

	var window_width 	 = $(window).width(),
	window_height 		 = window.innerHeight,
	header_height 		 = $(".default-header").height(),
	header_height_static = $(".site-header.static").outerHeight(),
	fitscreen 			 = window_height - header_height;


	$(".fullscreen").css("height", window_height)
	$(".fitscreen").css("height", fitscreen);

  //-------- Active Sticky Js ----------//
     $(".default-header").sticky({topSpacing:0});

  //------- Active Nice Select --------//
     $('select').niceSelect();

   // -------   Active Mobile Menu-----//

  $(".menu-bar").on('click', function(e){
      e.preventDefault();
      $("nav").toggleClass('hide');
      $("span", this).toggleClass("lnr-menu lnr-cross");
      $(".main-menu").addClass('mobile-menu');
  });


  $('.nav-item a:first').tab('show');



  // Select all links with hashes
  $('.main-menubar a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function(event) {
      // On-page links
      if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
        &&
        location.hostname == this.hostname
      ) {
        // Figure out element to scroll to
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        // Does a scroll target exist?
        if (target.length) {
          // Only prevent default if animation is actually gonna happen
          event.preventDefault();
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 1000, function() {
            // Callback after animation
            // Must change focus!
            var $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
              return false;
            } else {
              $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
              $target.focus(); // Set focus again
            };
          });
        }
      }
    });

    $('.active-banner-carousel').owlCarousel({
        center: true,
        items:1,
        loop:true
    });
    $('.next-trigger').click(function() {
        $(".active-banner-carousel").trigger('next.owl.carousel');
    });
    $('.prev-trigger').click(function() {
        $(".active-banner-carousel").trigger('prev.owl.carousel');
    });

    var findEl= $(".find-user"),
        findInputEl = findEl.find('input');

    $(".find-icon").click(function(e) {
        findEl.toggleClass('hidden');
    });

    findInputEl.on("keyup", function(event) {
        var trainerName = findInputEl.val().replace(/[^a-zA-Z0-9]/g, '');
        findInputEl.val(trainerName);
    });

    findInputEl.keyup(function(e) {
        if (e.keyCode == 13 && findInputEl.val() != "") {
            var trainerName = findInputEl.val().replace(/[^a-zA-Z0-9]/g, '');
            return window.location.href = "/code/search/" + trainerName;
        };
    });

 });


function setTooltip(el, message) {
    el.tooltip('hide')
       .attr('data-original-title', message)
       .tooltip('show');
};

function hideTooltip(el) {
    setTimeout(function() {
       el.tooltip('hide');
    }, 1000);
};

var continentCodeMap = {
    "Asia": "AS",
    "North America": "NA",
    "Africa": "AF",
    "Europe": "EU",
    "South America": "SA",
    "Australia": "OC"
};

var continentClassMap = {
    c1: "AF",
    c2: "AS",
    c3: "OC",
    c4: "EU",
    c5: "NA",
    c6: "SA"
};
