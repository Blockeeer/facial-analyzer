import { stackService } from '../services/stack.service.js'

export async function stackChatController(req, res, next) {
  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Messages are required',
      })
      return
    }

    const result = await stackService.chat(messages)

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
