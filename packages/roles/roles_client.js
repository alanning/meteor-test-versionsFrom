;(function () {

/**
 * Convenience functions for use on client.
 *
 * NOTE: You must restrict user actions on the server-side; any
 * client-side checks are strictly for convenience and must not be
 * trusted.
 *
 * @module UIHelpers
 */

var _registerHelper

////////////////////////////////////////////////////////////
// UI helpers
//
// Use a semi-private variable rather than declaring UI
// helpers directly so that we can unit test the helpers.
// XXX For some reason, the UI helpers are not registered 
// before the tests run.
//
Roles._uiHelpers = {

  /**
   * UI helper to check if current user is in at least one
   * of the target roles.  For use in client-side templates.
   *
   * @example
   *     {{#if isInRole 'admin'}}
   *     {{/if}}
   *
   *     {{#if isInRole 'editor,user'}}
   *     {{/if}}
   *
   *     {{#if isInRole 'editor,user' 'group1'}}
   *     {{/if}}
   *
   * @method isInRole
   * @param {String} role Name of role or comma-seperated list of roles
   * @param {String} [group] Optional, name of group to check
   * @return {Boolean} true if current user is in at least one of the target roles
   * @static
   * @for UIHelpers 
   */
  isInRole: function (role, group) {
    var user = Meteor.user(),
        comma = (role || '').indexOf(','),
        roles

    if (!user) return false
    if (!Match.test(role, String)) return false

    if (comma !== -1) {
      roles = _.reduce(role.split(','), function (memo, r) {
        if (!r || !r.trim()) {
          return memo
        }
        memo.push(r.trim())
        return memo
      }, [])
    } else {
      roles = [role]
    }

    if (Match.test(group, String)) {
      return Roles.userIsInRole(user, roles, group)
    }

    return Roles.userIsInRole(user, roles)
  }
}


// Attempt to register ui helper

if (Package.blaze && Package.blaze.Blaze.registerHelper) {
  // Meteor 0.9.1
  console.log(' Meteor 0.9.1+')
  _registerHelper = Package.blaze.Blaze.registerHelper
} else if (Package.ui) {
  // Meteor 0.8 - 0.9.0.1
  console.log(' Meteor 0.8 - 0.9.0.1')
  _registerHelper = Package.ui.UI.registerHelper
} else if (Package.handlebars) {
  // Meteor <0.8
  console.log(' Meteor <0.8')
  _registerHelper = Package.handlebars.Handlebars.registerHelper
}

if (_registerHelper) {
  _.each(Roles._uiHelpers, function (func, name) {
    _registerHelper(name, func)
  })
} else {
  console.log && console.log('WARNING: Roles template helpers not registered. Handlebars, UI, or Blaze packages not found')
}

}());
