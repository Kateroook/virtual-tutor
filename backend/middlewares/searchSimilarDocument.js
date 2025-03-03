const { format } = require("node-forge/lib/util");
const { pool } = require("../config/database");

async function searchSimilarDocuments(queryEmbedding, selectedFileIds) {
    const formattedEmbedding = `'[${queryEmbedding.join(',')}]'`;
    const formattedFileIds = selectedFileIds.map(id => `'${id}'`).join(',');

    let sql = format(`
        WITH SimilarTexts AS (
            SELECT
                f.id AS id,
                f.name AS file_name,
                f.file_url AS file_url,
                f.title AS title,
                ft.text AS text,
                e.embedding <=> %s::vector AS similarity
            FROM "Embeddings" e
            JOIN "FileTexts" ft ON ft.id = e."fileTextId"
            JOIN "Files" f ON f.id = ft."fileId"
            WHERE e.embedding <=> %s::vector <= 0.2
            ${selectedFileIds.length > 0 ? `AND f.id IN (${formattedFileIds})` : ''}
            ORDER BY similarity ASC
        )
        SELECT DISTINCT ON (id) *
        FROM SimilarTexts
        ORDER BY id, similarity
        LIMIT 5;
    `, formattedEmbedding, formattedEmbedding);

    const { rows } = await pool.query(sql);

    console.log(rows);
    console.log(sql);
    console.log(rows.length);

    return rows;
}

module.exports = { searchSimilarDocuments };
