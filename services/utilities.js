const sendSuccess = (res, data, meta = {}, status = 200) => {
    res.status(status).json({
        success: true,
        data,
        ...(Object.keys(meta).length && { meta })
    });
};

const sendError = (res, status, message, code, details) => {
    res.status(status).json({
        message,
        code,
        ...(details && { details })
    });
};

module.exports = {
    sendSuccess,
    sendError
};