import axios from "axios";
import { useState } from "react";

export default function useFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (url, options =  {}) => {
    setLoading(true);
    setError(null);

    try {

      const response = await axios(url, options);
      setData(response.data);
      
    } catch (error) {
      setError('An error occurred while fetching data.');
    }finally{
      setLoading(false);
    }
  }

  return { data, loading, error, fetchData };
}