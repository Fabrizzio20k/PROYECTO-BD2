from SpimiIndexer import SPIMIIndexer
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Permite solicitudes desde el front-end
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP
    allow_headers=["*"],  # Permite todos los encabezados
)

indexer = None
posible_extra_features = ["track_artist", "lyrics", "track_popularity", "track_album_id", "track_album_name", "track_album_release_date", "playlist_name", "playlist_id", "playlist_genre",
                          "playlist_subgenre", "danceability", "energy", "key", "loudness", "mode", "speechiness", "acousticness", "instrumentalness", "liveness", "valence", "tempo", "duration_ms", "language"]


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/create_index")
# receive it in a json format
def create_index(data: dict):
    # create the index
    if 'csv_path' not in data:
        return {"message": "csv_path is required"}
    if 'block_size' not in data:
        return {"message": "block_size is required"}

    global indexer
    total_time = time.time()
    indexer = SPIMIIndexer(
        csv_path='csv/' + data['csv_path'], block_size=data['block_size'])
    total_time = time.time() - total_time
    return {"message": "Index created successfully", "time": total_time, "status": 200}


@app.post("/search")
def search(data: dict):
    extra_features = None

    if indexer is None:
        return {"message": "Index not created", "status": 404}

    if 'query' not in data:
        return {"message": "query is required", "status": 400}

    if 'k' not in data:
        return {"message": "k is required", "status": 400}

    if 'additional_features' in data:
        extra_features = data['additional_features']
        for feature in extra_features:
            if feature not in posible_extra_features:
                return {"message": f"Feature {feature} is not valid", "status": 400}

    result = indexer.retrieve_top_k(
        data['query'], data['k'], additional_features=extra_features)
    return {"result": result, "message": "Search completed successfully", "status": 200}
