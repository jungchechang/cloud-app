const { DataTypes } = require("sequelize")
const sequelize = require("../sequelize")
const Business = require("./business")
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

module.exports = Photo