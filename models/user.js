const { DataTypes } = require("sequelize")
const sequelize = require("../lib/sequelize")
const bcrypt = require('bcryptjs')

const User = sequelize.define("user", {
    name:{type: DataTypes.STRING, allowNull: false},
    email:{type:DataTypes.STRING, allowNull: false},
    password:{type:DataTypes.STRING, allowNull: false},
    admin:{type:DataTypes.BOOLEAN, defaultValue: false, allowNull: true}
})

async function getUserByEmail (email){
    const user = await User.findOne({
        where:{email: email}
    })
    return user
}

async function validateCredentials (email, password){
    const user = await getUserByEmail(email)
    if (user && await bcrypt.compare(password, user.password)){
        return user
    }else{
        return null
    }
}

async function getUserById(id) {
    const user = await User.findByPk(id)
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email
    }
    return userData
}

module.exports = {User, getUserByEmail, getUserById, validateCredentials}