angular
  .module('app')
  .factory('FlashService', Service);

function Service($rootScope) {
  const service = {};

  service.Success = Success;
  service.Error = Error;
  initService();
  return service;
  function initService() {
    $rootScope.$on('$locationChangeStart', () => {
      clearFlashMessage();
    });

    function clearFlashMessage() {
      const flash = $rootScope.flash;
      if (flash) {
        if (!flash.keepAfterLocationChange) {
          delete $rootScope.flash;
        } else {
          // only keep for a single location change
          flash.keepAfterLocationChange = false;
        }
      }
    }
  }

  function Success(message, keepAfterLocationChange) {
    $rootScope.flash = {
      message,
      type: 'success',
      keepAfterLocationChange,
    };
  }

  function Error(message, keepAfterLocationChange) {
    $rootScope.flash = {
      message,
      type: 'danger',
      keepAfterLocationChange,
    };
  }
}
