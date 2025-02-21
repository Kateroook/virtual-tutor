const { DataTypes, Model } = require("sequelize");
const {sequelize} = require("../config/database");
class Embedding extends Model {}

Embedding.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    fileTextId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "FileTexts", key: "id" }
    },
    embedding: {
        type: DataTypes.TEXT, // stored in db as 'vector(768)'
        allowNull: false,
    },
}, {
    sequelize,
    modelName: "Embedding",
    tableName: "Embeddings",
    timestamps: true
});

module.exports = Embedding;