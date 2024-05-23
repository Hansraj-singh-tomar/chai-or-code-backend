class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.succeses = statusCode < 400
    }
}

export { ApiResponse }


// Status code -
// badi componies me hame inki spack sheet(Memo) milti hai jisme hame mention milta hai inn status code ka
// Informational responses (100 – 199)
// Successful responses(200 – 299)
// Redirection messages(300 – 399)
// Client error responses(400 – 499)
// Server error responses(500 – 599)