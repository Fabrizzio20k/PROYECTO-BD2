"use client";

import axios from 'axios';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Loader from '@/components/Loader';
import { Toaster, toast } from 'sonner';
import IndexCreation from '@/types/IndexCreation';
import SearchData from '@/interfaces/SearchData';
import Song from '@/types/Song';

const api = "http://localhost:8000/";

const features = [
    "track_artist", "lyrics", "track_album_name",
    "track_album_release_date", "playlist_name", "playlist_genre",
    "playlist_subgenre", "danceability", "energy", "loudness",
    "speechiness", "acousticness", "instrumentalness", "liveness", "valence", "tempo", "language"
];

export default function Page() {
    const { register, handleSubmit, formState: { errors } } = useForm<IndexCreation>();
    const { register: registerSearch, handleSubmit: handleSearchSubmit, formState: { errors: searchErrors } } = useForm<SearchData>();
    const [executionTime, setExecutionTime] = useState<number>(0);
    const [createdIndex, setCreatedIndex] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [songs, setSongs] = useState<Song[]>([]);

    const handleCreateIndex: SubmitHandler<IndexCreation> = async (data) => {
        try {
            setLoading(true);
            data.block_size = Number(data.block_size);  // Asegúrate de que block_size sea un número
            const response = await axios.post(api + "create_index", data);
            if (response.status === 200) {
                setExecutionTime(response.data.time);
                setCreatedIndex(true);
                toast.success("Index created successfully");
            } else {
                toast.error("An error occurred while creating the index");
            }
        } catch (error) {
            toast.error("An error occurred while creating the index");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch: SubmitHandler<SearchData> = async (data) => {
        data.k = Number(data.k);
        try {
            setLoading(true);
            const response = await axios.post(api + "search", data);
            if (response.status === 200) {
                setExecutionTime(response.data.result.query_time);
                let songs_retrieved = response.data.result.results;
                // delete atributes cosine_similarity, row_position
                songs_retrieved = songs_retrieved.map((song: any) => {
                    delete song.cosine_similarity;
                    delete song.row_position;
                    return song;
                });
                setSongs(songs_retrieved);
                console.log(songs_retrieved);
                toast.success("Search completed successfully");
            } else {
                toast.error("An error occurred while searching");
            }
        }
        catch (error) {
            toast.error("An error occurred while searching");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen bg-gray-900 text-white min-w-[350px]">
            <Toaster richColors />
            {loading &&
                <div className='absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center'>
                    <Loader />
                </div>
            }
            <div className='flex gap-4 w-full p-8 flex-col md:flex-row'>
                {!createdIndex && (
                    <div className="bg-gray-800 p-8 rounded shadow-md w-full md:w-1/2">
                        <h1 className="text-2xl font-bold mb-6 text-center">Index Creation</h1>
                        <form onSubmit={handleSubmit(handleCreateIndex)}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">CSV Path</label>
                                <select
                                    className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    {...register("csv_path", { required: "This field is required" })}
                                >
                                    <option value="">Select CSV File</option>
                                    <option value="spotify_songs.csv">spotify_songs.csv</option>
                                    <option value="default.csv">default.csv</option>
                                </select>
                                {errors.csv_path && <p className="mt-2 text-sm text-red-500">{errors.csv_path.message}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Block Size</label>
                                <input
                                    type="number"
                                    className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    {...register("block_size", {
                                        required: "This field is required",
                                        min: {
                                            value: 1,
                                            message: "Block size must be greater than 1"
                                        }
                                    })}
                                />
                                {errors.block_size && <p className="mt-2 text-sm text-red-500">{errors.block_size.message}</p>}
                            </div>
                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Create Index
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {createdIndex && (
                    <div className="bg-gray-800 p-8 rounded shadow-md w-full md:w-1/2">
                        <h1 className="text-2xl font-bold mb-6 text-center">Search your favorite songs 🎵</h1>
                        <form onSubmit={handleSearchSubmit(handleSearch)}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Query</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    {...registerSearch("query", { required: "This field is required" })}
                                />
                                {searchErrors.query && <p className="mt-2 text-sm text-red-500">{searchErrors.query.message}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">K</label>
                                <input
                                    type="number"
                                    className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    {...registerSearch("k", {
                                        required: "This field is required",
                                        min: {
                                            value: 1,
                                            message: "K must be greater than or equal to 1"
                                        }
                                    })}
                                />
                                {searchErrors.k && <p className="mt-2 text-sm text-red-500">{searchErrors.k.message}</p>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300">Additional Features</label>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {features.map((feature, index) => (
                                        <div key={index} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value={feature}
                                                className="h-4 w-4 text-indigo-600 border-gray-600 bg-gray-700 rounded focus:ring-indigo-500"
                                                {...registerSearch("additional_features")}
                                            />
                                            <label className="ml-2 block text-sm font-medium text-gray-300 break-all whitespace-normal">
                                                {feature}
                                            </label>
                                        </div>

                                    ))}
                                </div>
                            </div>
                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Search
                                </button>
                            </div>
                            {executionTime > 0 && (
                                <div className="mt-4 p-4 bg-gray-950 rounded-md shadow-inner text-gray-300">
                                    <pre className="text-xs text-green-400">
                                        Execution Time: {executionTime.toFixed(5)} ms
                                    </pre>
                                </div>
                            )}
                        </form>
                    </div>
                )}
                <div className="bg-gray-800 p-8 rounded shadow-md w-full md:w-1/2">
                    {!createdIndex && (
                        <div className='h-full flex justify-center items-center'>
                            <h1 className="text-2xl font-bold mb-6 text-center">Why not create an index first? 🦎</h1>
                        </div>
                    )}
                    {createdIndex && (
                        <div className="overflow-y-auto h-full">
                            <h1 className="text-2xl font-bold mb-6 text-center">Search Results</h1>
                            <div className="grid grid-cols-1 gap-4">
                                {songs.map((song, index) => (
                                    <div key={index} className="bg-gray-700 p-4 rounded-md shadow-md">
                                        <h2 className="text-lg font-bold">{song.track_name}</h2>
                                        <ul className="mt-2">
                                            {Object.entries(song).map(([key, value], idx) => (
                                                key !== 'track_name' && (
                                                    <li key={idx} className="text-sm">
                                                        <span className="font-semibold">{key.toUpperCase()}: </span>
                                                        {typeof value === 'object' ? JSON.stringify(value) : value}
                                                    </li>
                                                )
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                    )}
                </div>
            </div>
        </main>
    );
}
