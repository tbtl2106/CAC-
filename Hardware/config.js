require('dotenv').config()
var config = {}

config.endpoint = process.env.URL;
config.primaryKey = process.env.PRIMARY_KEY


config.database = {
    "id": "landslide-database"
};

config.container = {
    "id": "sensor-datahouse"
};

config.items = {}

module.exports = config


