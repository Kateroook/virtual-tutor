const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/database");
const FileText = require("./FileText");

const File = sequelize.define(
    "File",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: true,
            references: { model: "Users", key: "id" },
        },
    },
    {
        tableName: "Files",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
    }
);
File.hasMany(FileText, { foreignKey: 'fileId', onDelete: 'CASCADE' });

module.exports = File;