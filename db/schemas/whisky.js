var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var whiskySchema = new Schema({
  whiskyId: {
    type: String
  },
  distiller: {
    type: String
  },
  bottle: {
    type: String
  },
  region: {
    type: String
  },
  color: {
    type: String,
  },
  rating: {
    type: Number
  },
  notes: {
    type: String
  }
});

whiskySchema.methods.toClient = function() {
  return {
    id: this.id,
    distiller: this.distiller,
    bottle: this.bottle,
    region: this.region,
    color: this.color,
    rating: this.rating,
    notes: this.notes
  };
};

module.exports = whiskySchema;
