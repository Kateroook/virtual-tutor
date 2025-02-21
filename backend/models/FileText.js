const { DataTypes, Model } = require("sequelize");
const {sequelize} = require("../config/database");
const Embedding = require("./Embedding");

class FileText extends Model {}

FileText.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    fileId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "Files", key: "id" }
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    modelName: "FileText",
    tableName: "FileTexts",
    timestamps: true
});

FileText.hasMany(Embedding, { foreignKey: 'fileTextId', onDelete: 'CASCADE' });

module.exports = FileText;