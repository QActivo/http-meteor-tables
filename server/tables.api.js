Meteor.methods({
  'httptables.collection-data': function (collection_name, selector, options) {
    const collection = Package['mongo']
      .MongoInternals
      .defaultRemoteCollectionDriver()
      .open(collection_name);

    return collection.find(selector, options).fetch();
  },
  'httptables.collection.total_elems': function (collection_name, selector) {
    const collection = Package['mongo']
      .MongoInternals
      .defaultRemoteCollectionDriver()
      .open(collection_name);
    
    return collection.find(selector).count();
  }
});