var back = {
  setup: function () {
      // button that I have added to the DOM to navigate back with
      var $buttonNav = $( '.navigation_back-button' );

      // binds event listener to my button element
      $buttonNav.attr( "onclick", "back.back();" );

      console.log("your back button is setup");
  },


  /**
   * back
   *   Function that takes the user back to the last page they were on
   *
   */
  back: function() {
    //toggle the navigation UI
    //adobeDPS.Gesture.toggleNavigationUI();
    window.location = "goto://FolioNavigation/lastview";

    console.log("GO BACK!");
  }
};
