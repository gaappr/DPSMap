//Main object that holds functions that utilize the Adobe DPS API and allow elements...
//to interact with the back end of the app.
var api = {

  // keeps track of the touch start (x, y) positions
  touchStartX: null,
  touchStartY: null,

  /**
   * setUp
   *   Initial function that uses jquery to select elements of the app, as documented...
   *   in the Adobe DPS API documentation.
   */
  setUp: function() {
    //$( document ).ready(function() {
      // disable the default navigation controls
      // i.e. prevents tap on screen to bring up navigation UI
      adobeDPS.Gesture.disableNavigation();

      // button that I have added to the DOM to navigate back with
      //var $buttonNav = $( '.navigation_back-button' );

      // binds event listener to my button element
      //$buttonNav.attr( "onclick", "api.back();" );

      // binds the touch listeners to the whole HTML body
      document.body.addEventListener('touchstart', api.touchStartHandler, false);
      document.body.addEventListener('touchmove', api.touchMoveHandler, false);
    //});
    //
      console.log("your api is setup");
  },

  /**
   * touchStartHandler
   *   Listener for the initial touch position.
   */
  touchStartHandler: function (touchEvent) {
    api.touchStartX = touchEvent.touches[0].clientX;
    api.touchStartY = touchEvent.touches[0].clientY;
  },

  /**
   * touchStartHandler
   *   Listener for the duration of the swipe position.
   */
  touchMoveHandler: function (touchEvent) {
    if (!api.touchStartX || !api.touchStartY) { // just in case
      return;
    }
    // get the touch move positions
    var touchMoveX = touchEvent.touches[0].clientX;
    var touchMoveY = touchEvent.touches[0].clientY;
    // calculate the swipe to determine vertical vs horizontal movements
    var diffHorizontal = api.touchStartX - touchMoveX;
    var diffVertical = api.touchStartY - touchMoveY;

    // detect horizontal swipe only
    //if (Math.abs(diffHorizontal) > Math.abs(diffVertical)) {
      // regardless of swiping left or right,
      // call adobeDPS::Gesture::relinquishCurrentGesture()
      // this will re-enable the default navigation once and
      // allow the user to swipe to the next or previous article
      //adobeDPS.Gesture.relinquishCurrentGesture();
    //}
    /* reset touch start values */
    api.touchStartX = null;
    api.touchStartY = null;
  },

  /**
   * back
   *   Function that takes the user back to the last page they were on
   *
   */
  //back: function() {
  //  //toggle the navigation UI
  //  //adobeDPS.Gesture.toggleNavigationUI();
  //  window.location = "goto://FolioNavigation/lastview";
  //}
  //

};
