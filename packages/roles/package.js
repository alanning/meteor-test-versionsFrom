Package.describe({
  summary: "Role-based authorization",
  version: "1.2.12",
  git: "https://github.com/alanning/meteor-roles.git",
  name: "alanning:roles"
});

Package.on_use(function (api) {
  var both = ['client', 'server'];

  api.use(['underscore', 'accounts-base'], both);

  if (api.versionsFrom) {
    // Meteor [0.9+]
    //api.versionsFrom('METEOR@0.9.0');
    api.use(['blaze'], 'client', {weak: true});
  } else if(uiExists()) {
    // Meteor [0.8, 0.9)

    // This is needed due to Meteor Issue #1358
    //   https://github.com/meteor/meteor/issues/1358
    //
    // In meteor < 0.9, the 'weak' flag only works with packages 
    // that are in meteor's internal cache. If the package does not
    // exist (say, on earlier versions of Meteor where 'handlebars' 
    // is used) or for atmosphere packages, this errors out. It even 
    // breaks out of try-catch blocks so that doesn't work either.
    api.use(['ui'], 'client', {weak: true});
  } else {
    api.use(['handlebars'], 'client', {weak: true});
  }

  api.export && api.export('Roles');

  api.add_files('roles_server.js', 'server');
  api.add_files('roles_common.js', both);
  api.add_files('roles_client.js', 'client');
});

Package.on_test(function (api) {
  var both = ['client', 'server'];

  // `accounts-password` is included so `Meteor.users` exists

  if (api.versionsFrom) {
    api.use(['alanning:roles','accounts-password','tinytest'], both);
  } else {
    api.use(['roles','accounts-password','tinytest'], both);
  }

  api.add_files('tests/client.js', 'client');
  api.add_files('tests/server.js', 'server');
});

// workaround for meter issue #1358
// https://github.com/meteor/meteor/issues/1358
function uiExists() {
  var fs = Npm.require('fs'),
      path = Npm.require('path'),
      meteorPackages;

  try {
    meteorPackages = fs.readFileSync(path.resolve('.meteor/packages'), 'utf8');
  } catch (ex) {
    return false;
  }

  if (!meteorPackages) {
    return false;
  }

  if (/^\s*ui\s*$/m.test(meteorPackages)) {
    // definitely there
    return true;
  }

  //if (/^\s*standard-app-packages\s*$/m.test(meteorPackages)) {
    // The ui package may or may _not_ be there...
    // Releases before 0.8.0 had standard-app-packages but not
    // ui.  Without weak references working properly, there is 
    // no good way to detect the inclusion of the ui package in
    // bundled apps.
  //}

  return false;
}
