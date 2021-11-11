const getDBCollection = (req, collectionName = 'userData') => {
  return req.app.locals.db.collection(collectionName);
};

module.exports = getDBCollection;
