class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

const handleError = (err, res) => {
    const { statusCode, message } = err;
    res.status(statusCode).json({
      status: "error",
      statusCode,
      message
    });
  };

module.exports = {
    handle: (err, result, next) => {
        if (err) {
            return next(new Error(err));
        }

        // if (!items || items.length < 1) {
        //   return Status.returnStatus(res, Status.NULL);
        // }
        next(null, result);
    },
    ErrorHandler,
    handleError
}