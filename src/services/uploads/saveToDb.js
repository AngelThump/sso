module.exports = function() {
    return async function(context) {
      const path = context.path
      const app = context.app;
      if(path === 'uploads/profile') {
        context.result.imageURL = `${context.app.get('spacesCDNEndpoint')}profile-logos/${context.result.id}`
        app.service('users')
        .patch(context.params.user.id, {
          profile_logo_url: context.result.imageURL
        }).catch(e=> {
          console.error(e);
        })
      } else if(path === 'uploads/offline') {
        context.result.imageURL = `${context.app.get('spacesCDNEndpoint')}offline-images/${context.result.id}`
        app.service('users')
        .patch(context.params.user.id, {
          profile_logo_url: context.result.imageURL
        }).catch(e=> {
          console.error(e);
        })
      }
      return context;
    };
  };