DROP TABLE IF EXISTS songs;

-- Creación de la tabla 'articles'
CREATE TABLE songs (
    track_id TEXT PRIMARY KEY,
    track_name TEXT,
    track_artist TEXT NULL,
	track_album_name TEXT,
	lyrics TEXT
);

COPY Public."songs" FROM 'C:/Users/vilch/OneDrive/Escritorio/PROYECTO-BD2/backend/csv/spotify_songs.csv' DELIMITER ',' CSV HEADER;

select * from songs

-- Añadiendo nuevas columnas para almacenar vectores de texto ponderados
ALTER TABLE songs ADD COLUMN weighted_tsv tsvector;
ALTER TABLE songs ADD COLUMN weighted_tsv2 tsvector;

-- Actualización de las columnas 'weighted_tsv' y 'weighted_tsv2' con valores ponderados
UPDATE songs SET
weighted_tsv = x.weighted_tsv,
weighted_tsv2 = x.weighted_tsv
FROM (
SELECT track_id,
setweight(to_tsvector('english', COALESCE(track_name,'')), 'A') ||
setweight(to_tsvector('english', COALESCE(lyrics,'')), 'B')
AS weighted_tsv
FROM songs
) AS x
WHERE x.track_id = songs.track_id;

-- Selecciona las columnas 'weighted_tsv' y 'weighted_tsv2' para ver su contenido
select weighted_tsv,weighted_tsv2 from songs

-- Creación de un índice para la columna 'weighted_tsv2' usando GIN (Generalized Inverted Index)
CREATE INDEX weighted_tsv_idx1e3 ON songs USING GIN (weighted_tsv2);


-- Sin índice:
vacuum analyze;
EXPLAIN ANALYZE
SELECT track_id, track_name, ts_rank_cd(weighted_tsv, query) AS rank
FROM songs, to_tsquery('english', 'imagination') query
WHERE query @@ weighted_tsv
ORDER BY rank DESC
LIMIT 10;

-- Con índice:
ANALYZE songs;
SET enable_seqscan = OFF;
EXPLAIN ANALYZE
SELECT track_id, track_name, ts_rank_cd(weighted_tsv2, query) AS rank
FROM songs, to_tsquery('english', 'imagination') query
WHERE query @@ weighted_tsv2
ORDER BY rank DESC
LIMIT 10;



