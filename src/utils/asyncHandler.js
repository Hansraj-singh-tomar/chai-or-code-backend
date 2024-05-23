const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }

// search - nodejs api error

// const asyncHandler = (fn) => () => { }
// const asyncHandler = (fn) => async () => { }
// const asyncHandler = (fn) => {
//     return () => {
//     }
// }

// another approach is that
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.code || 500).json({ success: false, message: error.message })
//     }
// }
