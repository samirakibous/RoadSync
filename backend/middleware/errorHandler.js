const errorHandler = (err, req, res, next) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Une erreur est survenue sur le serveur";
  
    res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
    });
}

export default errorHandler;
