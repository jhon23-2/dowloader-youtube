const { z } = require('zod')

const downloadSchema = z.object({
  url: z.string()
    .url("Invalid URL format. Please include http:// or https://")
    .refine(
      (val) => val.includes('youtube.com') || val.includes('youtu.be'),
      "URL must be a valid YouTube link."
    ),
  format: z.enum(['video', 'audio'], "Format must be 'video' or 'audio'.")
});


module.exports = downloadSchema