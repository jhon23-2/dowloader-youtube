const { formatDuration, formatFileSize } = require('../tools/helper')
const ytdl = require("@distube/ytdl-core");


const cookies = [
  { name: "__Secure-1PAPISID", value: "LQZAxNeloD4Y4Qgo/ATZqVhPaohgeQU71J" },
  { name: "__Secure-1PSID", value: "g.a0000Ah8VY1QddVx_UDWrYQagBpyJnHErIRPWlwV66sz1MU4SugtwpUP2h36Fu2n_f_7lL0tbAACgYKAf4SARUSFQHGX2Mif9kDyPCmdiPRyR8PVQ7IExoVAUF8yKon45tLMMYOwu3JmKuH8Y1W0076" },
  { name: "__Secure-1PSIDCC", value: "AKEyXzW4ope6EqpoIcr003Mh0pNsVPJyoAKo-PrCNIo1c0bdIkYP6Fizj16qeJ2VVTun7j9mXg" },
  { name: "__Secure-3PAPISID", value: "sidts-CjQB5H03P2z8sf8BMSUFrcOvCRc6T-v8adbLv99fYPQ69f7eWPwfONWAGph3_n_iqPCfvTvPEAA" },
  { name: "__Secure-3PSID", value: "LQZAxNeloD4Y4Qgo/ATZqVhPaohgeQU71J" },
  { name: "__Secure-3PSIDCC", value: "g.a0000Ah8VY1QddVx_UDWrYQagBpyJnHErIRPWlwV66sz1MU4Sugtx-6GOtgJ7D7kwx4bx81o1wACgYKAZESARUSFQHGX2MiID7TH-aqQqk3WdRAJg3AERoVAUF8yKpT53Rz5jVIKgIp_-9XrNID0076" },
  { name: "APISID", value: "AKEyXzVAQUpJg5woQYKvEAa_5cntY1X0m1yA-2H4rMBP4OuJ_erfC3-hgqd0YMwunvK94PyFiA" },
  { name: "HSID", value: "sidts-CjQB5H03P2z8sf8BMSUFrcOvCRc6T-v8adbLv99fYPQ69f7eWPwfONWAGph3_n_iqPCfvTvPEAA" },
  { name: "LOGIN_INFO", value: "AFmmF2swRQIgXim9gWHEdarU5Ek3MDxROPbwl2WxmD726xq9PzkoI44CIQDSm73niF6cwQw9G7dzsVY4BN963qmqVjTVqaRBl2g1vw:QUQ3MjNmekpCVFE5YVJxN3FTS1BUSDFwYTVPVUpjYjl1eEZOU19TSEhWOE1UOW5LSmlBdjE5Mm45b09Ea09QdmM3cFRadkZIUzdVS2VYWWtUYUFxd08tRDZrZzVqTE9qbERKb2Q2d3RlR1RRY0wwWXJ5dTdveE90MlhmWUZxaG00MlFXaDFMQWRkbkxmTEZzVXcyLVh0eWpwQjhwbS1kOGZBajdDRktsUVpnTUlpVTI2QjRzMkFMcnhMdXpDU3B5MFlYejVncDRmdTBtblVRTVBVVnBJLXlNSUxtNVBPV3Fjdw==" },
  { name: "PREF", value: "Yf4=4010000&f6=40000000&tz=America.Bogota&f7=100" },
  { name: "SAPISID", value: "LQZAxNeloD4Y4Qgo/ATZqVhPaohgeQU71J" },
  { name: "SID", value: "g.a0000Ah8VY1QddVx_UDWrYQagBpyJnHErIRPWlwV66sz1MU4Sugt4Pe90mGrfgBu2Fj15LKrYgACgYKAUkSARUSFQHGX2MiEif4ps1MroeVg5g_QEgayBoVAUF8yKppK2pRBQrSkAYnm0GKT-q80076" },
  { name: "SIDCC", value: "AKEyXzUf5vJ3hbJKDuJNIEpm1k0XFpdBsEa0hA9XRBPExV3yYmF0EnzeksLYCEvW-t8fOshLdm8" },
  { name: "SSID", value: "AVMnhscB6bIinxraf" }
];

const agentOptions = {
  pipelining: 5,
  maxRedirections: 0
};



class YoutubeController {

  static async getInformation(req, res) {

    //at this point req.body is validated by (validateBodyMiddleware)
    const { url, format } = req.body;

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }


    try {
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