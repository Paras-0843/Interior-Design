const mailjet = require('node-mailjet')
    .connect('697e23602b86965b0bac22b5476739a1',
        'a9dcf880c60939409e86731795f6fe7c')


module.exports = function (email, name,callback) {

    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "paras0843.cse19@chitkara.edu.in",
                        "Name": "Paras"
                    },
                    "To": [
                        {
                            "Email": email,
                            "Name": `${name}`
                        }
                    ],
                    "Subject": "Greetings from Deluxe Interiors!",
                    "TextPart": `Hello ${name} !`,
                    "HTMLPart": `<h3>Dear ${name} !, welcome to Deluxe Interiors!</h3><br />Thanks for joining us.We hope you have a great experience!</a> `,
                    "CustomID": "AppGettingStartedTest"
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
            callback();
        })
        .catch((err) => {
            console.log(err.statusCode)

            callback(err);
        })

}