const express = require('express')
const morgan = require('morgan')
const path = require('path')
const bodyParser = require('body-parser');
const routes = require('./routes');


let app = express()
app.use(morgan('combined'))


let options = {
	dotfiles: 'ignore',
	index: false
}

app.use(express.static(path.join(__dirname, 'public'),
options))
app.use(bodyParser.urlencoded({
	extended: true
}))

app.use((req,res,next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
})
app.use(routes)

let server = app.listen(process.env.PORT || 3000, function () {
	let host = server.address().address
	let port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)

})

// queryContainer().then(() => { exit(`Completed successfully`); })
// .catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });
