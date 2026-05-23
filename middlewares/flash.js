/**
 * Middleware que disponibiliza flash messages em res.locals para as views
 */
const flashMiddleware = (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.info = req.flash('info');
  next();
};

export default flashMiddleware;;
