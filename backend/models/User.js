const { DataTypes } = require('sequelize');
const {sequelize} = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
});

User.hasMany(require("./File"), { foreignKey: "uploaded_by" });

module.exports = User;
