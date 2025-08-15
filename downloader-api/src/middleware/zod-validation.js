const downloadSchema = require('../scheme/body-scheme')

const validateBodyMiddleware = (req, res, next) => {


  try {

    if (!req.body) {
      return res.status(400).json({ error: "Missed body , body must be required" })
    }

    const result = downloadSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({ error: `Body validation error: ${JSON.parse(result.error)[0].message}` })
    }

    req.body = result.data

    next()
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json(JSON.parse(error)[0].message)
    }
    return res.status(500).json(error.message)

  }

}


const validateParamsMiddleware = (req, res, next) => {
  try {
    if (!req.params) return res.status(400).json({ error: "Missed params , params must be required" })

    const result = downloadSchema.partial().safeParse(req.params)

    if (!result.success) {
      return res.status(400).json({ error: `Body validation error: ${JSON.parse(result.error)[0].message}` })
    }

    req.params = result.data

    next()

  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json(JSON.parse(error)[0].message)
    }
    return res.status(500).json(error.message)
  }
}
module.exports = { validateBodyMiddleware, validateParamsMiddleware }