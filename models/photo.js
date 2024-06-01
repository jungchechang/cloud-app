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

async function createNewPhoto(photoData){
    const result = await Photo.create(photoData, PhotoClientFields)
    if (result){
        return result
    }else{
        return null
    }
}

async function getPhotoById(photoId){
    const photo = await Photo.findByPk(photoId)
    if (photo){
        return photo
    }else{
        null
    }
}

async function updatePhotoById(photoId, photoData){
    const result = await Photo.update(photoData, {
        where:{
            id: photoId
        }
    })
    if (result){
        return result
    }else{
        return null
    }
}

async function deletePhotoById(photoId) {
    const result = await Photo.destroy({
        where:{
            id: photoId
        }
    })
    if (result){
        return result
    }else{
        return null
    }
}

module.exports = {Photo, PhotoClientFields, createNewPhoto, getPhotoById, updatePhotoById, deletePhotoById}