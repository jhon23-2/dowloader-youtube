import { useState } from "react";
import useFetch from "../../hooks/fetch-hook";

export const MainContent = () => {

  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('video');
  const { data, loading, error, fetchData } = useFetch();


  const handlerSubmit = async (e) => {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)

    const urlInput = formData.get('url')
    const formatInput = formData.get('format')

    if (!urlInput || !formatInput) {
      alert('Please provide both URL and format.')
      return
    }

    if (!urlInput?.includes('youtube.com') && !urlInput?.includes('youtu.be')) {
      alert('Please enter a valid YouTube URL.');
      return;
    }


    // we goint to set apiUrl to production mode later
    
    const apiUrl = window.location.origin + '/api/v1/info'; 
    const body = { url, format }

    fetchData(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(body)
    })

  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8'>

        <div className='w-full md:w-2/3'>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">YouTube Downloader</h1>
          <p className="text-center text-gray-600 mb-8">Enter a YouTube URL to download a video or audio file.</p>

          <form id="downloadForm" className="flex flex-col space-y-4" onSubmit={handlerSubmit}>

            <div>
              <label htmlFor="url" className='block text-sm font-medium text-gray-700'>YouTube URL</label>
              <input
                type="text"
                autoComplete='off'
                id='url'
                name='url'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder='e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                required
                className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              />
            </div>

            <div>
              <label htmlFor="format" className='block text-sm font-medium text-gray-700'>Select Format</label>
              <select
                name="format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                id="format"
                className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>

                <option value="video">Video (MP4)</option>
                <option value="audio">Audio (MP3)</option>
              </select>
            </div>

            <button type="submit" id="submitBtn"
              disabled={loading ? true : false}
              style={{ opacity: loading ? 0.6 : 1 }}
              className="w-full cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-semibold bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200">
              Get
            </button>

            {loading && (
              <div id="loading" className='flex items-center justify-center space-x-2 text-gray-600 mt-4'>
                <div className="w-5 h-5 border-4 border-gray-300 rounded-full spinner"></div>
                <span>Processing... Please wait.</span>
              </div>
            )}

          </form>

          <div id="message" className="mt-4 text-center text-sm font-medium">
            {
              !loading && data && !error && (
                <div className="mt-4 text-center text-sm font-medium text-green-500">Video information loaded. Click "Start Download" to get your file.</div>
              )
            }
            {
              error && (
                <div className="mt-4 text-center text-sm font-medium text-red-500">Error fetching video information. Please check the URL and try again.</div>
              )
            }
          </div>


        </div>

        <aside className="w-full md:w-1/3 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Video Information</h2>
          <div id="videoInfo" className="space-y-4 text-gray-700">
            {
              loading && <div className="text-center text-gray-500">Fetching video information...</div>
            }

            {
              !loading && !data && !error && (
                <div className="text-center text-gray-500">Enter a YouTube URL to get started.</div>
              )
            }

            {
              !loading && data && data.title && (
                <div>
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe src={data.embed['iframeUrl']}
                      className="w-full h-64 md:h-48 rounded-md shadow-sm"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen>
                    </iframe>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">${data.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Channel: {data.channel}</p>
                  <p className="text-sm text-gray-600 mb-2">Duration: {data.duration}</p>
                  <p className="text-sm text-gray-600 mb-4">Size: {data.fileSize}</p>

                  <a href={data.downloadUrl} target="_blank"
                    className="mt-4 block text-center py-2 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md transition-colors duration-200">
                    Start Download
                  </a>
                </div>
              )
            }

            {
              error && (
                <div class="text-center text-gray-500">Failed to fetch video information.</div>
              )
            }
          </div>
        </aside>

      </div>
    </div>
  )
}
