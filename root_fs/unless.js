var unless = function(middleware, ...paths) {
    return function(req, res, next) {
        // console.log(`'${req.path}'`);
        // if (path === req.path) {
        if (paths.some(path=>req.path.indexOf(path) == 0) || req.path == "/") {
            return next();
        } else {
            return middleware(req, res, next);
        }
    };
};

module.exports = unless;