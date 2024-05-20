const { DataTypes } = require('sequelize')
const sequelize = require("../lib/sequelize")

const {Business} = require("./business")
const Review = sequelize.define('review', {
    userId: {type: DataTypes.INTEGER, allowNull: false },
    businessId: {type: DataTypes.INTEGER, allowNull: false},
    dollars: {type: DataTypes.INTEGER, allowNull: false},
    stars: {type: DataTypes.FLOAT, allowNull: false},
    review: {type: DataTypes.STRING, allowNull: true}
})
Business.hasMany(Review, {
    foreignKey: {allowNull: false},
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
})
Review.belongsTo(Business)


ReviewClientFields = [
    'userId',
    'dollars',
    'stars',
    'review',
    'businessId'
]

module.exports = {Review, ReviewClientFields}