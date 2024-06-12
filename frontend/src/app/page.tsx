"use client";

import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import IndexCreation from '@/types/IndexCreation';
import Loader from '@/components/Loader';

const api = "http://localhost:8000/";

export default function Page() {
    const { register, handleSubmit, formState: { errors } } = useForm<IndexCreation>();
    const [loading, setLoading] = useState(false);
    const [indexCreation, setIndexCreation] = useState<IndexCreation>({
        csv_path: "",
        block_size: 1
    });

    const handleCreateIndex = async (data: IndexCreation) => {
        try {
            setLoading(true);
            data.block_size = Number(data.block_size);  // Asegúrate de que block_size sea un número
            const response = await axios.post(api + "create_index", data);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100">
            {loading &&
                <div className='absolute top-0 left-0 w-full h-full bg-black bg-opacity-90 flex items-center justify-center'>
                    <Loader />
                </div>
            }
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Index Creation</h1>
                <form onSubmit={handleSubmit(handleCreateIndex)}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">CSV Path</label>
                        <select
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            {...register("csv_path", { required: "This field is required" })}
                        >
                            <option value="">Select CSV File</option>
                            <option value="spotify_songs.csv">spotify_songs.csv</option>
                            <option value="default.csv">default.csv</option>
                        </select>
                        {errors.csv_path && <p className="mt-2 text-sm text-red-600">{errors.csv_path.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Block Size</label>
                        <input
                            type="number"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            {...register("block_size", {
                                required: "This field is required",
                                min: {
                                    value: 1,
                                    message: "Block size must be greater than 1"
                                }
                            })}
                        />
                        {errors.block_size && <p className="mt-2 text-sm text-red-600">{errors.block_size.message}</p>}
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
        </main>
    );
}