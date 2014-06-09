"use strict";


var mongoose = require('mongoose');

var waigo = require('waigo'),
  schema = waigo.load('support/db/mongoose/schema');


var logSchema = schema.create({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  trigger: { type: mongoose.Schema.Types.ObjectId, ref: 'Trigger' },
  text: String,
  meta: { type: mongoose.Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
}, {
  // capped: { 
  //   /* 20MB max size, max. 1000 entries */
  //   size: 20971520, max: 1000, autoIndexId: true 
  // },
});


/**
 * Get for job
 * @return {Promise} 
 */
logSchema.static('getForJob', function(jobId) {
  return this.find({
    job: jobId
  }).sort({created_at: -1}).populate('job').populate('trigger').exec();
});



/**
 * Get recent
 *
 * @param {Number} [maxNumToFetch] Max. no. of items to fetch. Default is 1000.
 * @return {Promise} 
 */
logSchema.static('getRecent', function(maxNumToFetch) {
  maxNumToFetch = maxNumToFetch || 1000;

  return this.find().sort({created_at: -1})
    .populate('job').populate('trigger').limit(maxNumToFetch).exec();
});



module.exports = function(dbConn) {
  return dbConn.model('Log', logSchema);
}




