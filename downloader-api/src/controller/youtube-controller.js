const { formatDuration, formatFileSize } = require('../tools/helper')
const ytdl = require("@distube/ytdl-core");




class YoutubeController {

  static async getInformation(req, res) {

    //at this point req.body is validated by (validateBodyMiddleware)
    const { url, format } = req.body;

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }


    try {
      const cookies = JSON.parse(process.env.YOUTUBE_COOKIE || '[]');
      const agentOptions = JSON.parse(process.env.AGENT_OPTIONS || '{}');

      const agent = ytdl.createAgent(cookies, agentOptions);

      const info = await ytdl.getInfo(url, { agent });
      const videoDetails = info.videoDetails;

      const downloadLink = `${req.protocol}://${req.get('host')}/api/v1/download?url=${encodeURIComponent(url)}&format=${format}`;

      // Get file size from a format
      let bestFormat;
      if (format === 'video') {
        bestFormat = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
      } else {
        bestFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      }

      const fileSize = bestFormat ? bestFormat.contentLength : 'Unknown';

      res.json({
        title: videoDetails.title,
        channel: videoDetails.author.name,
        thumbnail: videoDetails.thumbnails[0].url,
        embed: videoDetails.embed,
        duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
        fileSize: formatFileSize(parseInt(fileSize)),
        downloadUrl: downloadLink,
      });

    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Failed to fetch video information. Please try a different URL.' });
    }
  }

  static async download(req, res) {
    //at this point req.body is validated by (validateBodyMiddleware)
    const { url, format } = req.query;

    if (!ytdl.validateURL(url)) {
      return res.status(400).send('Invalid YouTube URL');
    }

    const options = { quality: format === 'video' ? 'highestvideo' : 'highestaudio' };

    const cookies = JSON.parse(process.env.YOUTUBE_COOKIE || '[]');
    const agentOptions = JSON.parse(process.env.AGENT_OPTIONS || '{}');

    try {
      const agent = ytdl.createAgent(cookies, agentOptions);

      const stream = ytdl(url, options, { agent });

      stream.on('info', (info) => {
        const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Sanitize filename

        res.header('Content-Disposition', `attachment; filename="${videoTitle}.${format === 'video' ? 'mp4' : 'mp3'}"`);
        ytdl(url, options).pipe(res);
      });

    } catch (error) {
      console.log(error)
      res.status(500).send('Failed to start download stream.');
    }
  }

}


module.exports = YoutubeController