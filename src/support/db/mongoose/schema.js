"use strict";

var mongoose = require('mongoose'),
  waigo = require('waigo');


var viewObjectMethodName = Object.keys(
    waigo.load('support/mixins').HasViewObject
).pop();



/**
 * Create a Mongoose schema.
 *
 * This will ensure all Mongoose models created from this schema implement the 
 * `HasViewObject` mixin. The mixin will also be applied to collections of 
 * model instances so that query results can be rendered directly to the client.
 * 
 * @param  {Object} schemaDescription Gets passed to mongoose.Schema constructor
 * @param  {Object} options           Gets passed to mongoose.Schema constructor
 * @return {Object}                   The created schema.
 */
exports.create = function(schemaDescription, options) {
  options = options || {};

  // add timestamp fields
  if (options.addTimestampFields) {
    schemaDescription.created_at = schemaDescription.updated_at = Date;
  }

  var schema = new mongoose.Schema(schemaDescription, options);

  // auto-set timestamp fields during 'save'
  if (options.addTimestampFields) {
    schema.pre('save', function(next){
      var now = new Date();
      this.updated_at = now;
      if ( !this.created_at ) {
        this.created_at = now;
      }
      next();
    });
  }


  /**
   * Get which keys to include when generating a view object representation.
   * 
   * @param  {Object} ctx Request context.
   * @return {Array} 
   */
  schema.method('viewObjectKeys', function(ctx) {
    return ['_id'].concat(Object.keys(schemaDescription));
  });


  /**
   * Format a value for inclusion in a view object.
   * 
   * @param  {Object} ctx Request context.
   * @param  {String} key Key to which value belongs.
   * @param  {*} val The value.
   * @return {*}
   */
  schema.method('formatForViewObject', function*(ctx, key, val) {
    return val;
  });



  /**
   * Get view object representation of this model.
   * @param  {Object} ctx Request context.
   * @return {Object}
   */
  schema.method(viewObjectMethodName, function*(ctx) {
    var self = this;

    var ret = {};

    var keys = self.viewObjectKeys(ctx);

    for (let idx in keys) {
      let key = keys[idx];

      ret[key] = self[key];

      if (ret[key] instanceof mongoose.Model) {
        ret[key] = yield ret[key].toViewObject(ctx);
      } else {
        ret[key] = yield self.formatForViewObject(ctx, key, ret[key]);
      }
    }

    return ret;
  });



  return schema;
};

