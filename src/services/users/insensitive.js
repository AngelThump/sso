module.exports = function() {
  return function(hook) {
    if(typeof hook.params.query.username !== 'undefined') {
    	hook.params.query.username = hook.params.query.username.toLowerCase();
    }
  };
};
