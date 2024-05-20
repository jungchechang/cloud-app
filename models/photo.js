const { DataTypes } = require('sequelize')
const sequelize = require("../lib/sequelize")
const {Business} = require("./business")
const Photo = sequelize.define('photo', {
    userId: {type: DataTypes.INTEGER, allowNull: false },
    businessId:{type: DataTypes.INTEGER, allowNull: false},
    caption: {type: DataTypes.STRING, allowNull: true}
})
Business.hasMany(Photo, {
    foreignKey: {allowNull: false},
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
Photo.belongsTo(Business)


PhotoClientFields = [
    'userId',
    'caption',
    'businessId'
]

module.exports = {Photo, PhotoClientFields}