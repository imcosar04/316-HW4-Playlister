const auth = require('../auth')
const db = require('../db')

createPlaylist = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  const body = req.body
  if (!body) return res.status(400).json({ success: false, error: 'You must provide a Playlist' })

  try {
    const created = await db.createPlaylist({
      ...body,
      ownerEmail: body.ownerEmail || req.userEmail,
    })

    await db.appendUserPlaylist(req.userId, created._id || created.id)

    return res.status(201).json({ playlist: created })
  } catch (err) {
    return res.status(400).json({ errorMessage: 'Playlist Not Created!' })
  }
}

deletePlaylist = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  try {
    const list = await db.getPlaylistById(req.params.id)
    if (!list) return res.status(404).json({ errorMessage: 'Playlist not found!' })

    const owner = await db.getUserByEmail(list.ownerEmail)
    if (!owner || String(owner._id || owner.id) !== String(req.userId)) {
      return res.status(400).json({ errorMessage: 'authentication error' })
    }

    await db.deletePlaylistById(req.params.id)
    return res.status(200).json({})
  } catch (err) {
    return res.status(400).json({ errorMessage: 'Playlist not found!' })
  }
}

getPlaylistById = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  try {
    const list = await db.getPlaylistById(req.params.id)
    if (!list) return res.status(400).json({ success: false, error: 'Not found' })

    const owner = await db.getUserByEmail(list.ownerEmail)
    if (!owner || String(owner._id || owner.id) !== String(req.userId)) {
      return res.status(400).json({ success: false, description: 'authentication error' })
    }
    return res.status(200).json({ success: true, playlist: list })
  } catch (err) {
    return res.status(400).json({ success: false, error: err })
  }
}

getPlaylistPairs = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  try {
    // get current user to access their email
    const user = await db.getUserById(req.userId)
    const playlists = await db.getPlaylistPairs(user.email)

    const pairs = (playlists || []).map((p) => ({ _id: p._id || p.id, name: p.name }))
    return res.status(200).json({ success: true, idNamePairs: pairs })
  } catch (err) {
    return res.status(400).json({ success: false, error: err })
  }
}

getPlaylists = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  try {
    const all = await db.getAllPlaylists?.()
    if (!all || !all.length) return res.status(404).json({ success: false, error: 'Playlists not found' })
    return res.status(200).json({ success: true, data: all })
  } catch (err) {
    return res.status(400).json({ success: false, error: err })
  }
}

updatePlaylist = async (req, res) => {
  if (auth.verifyUser(req) === null) {
    return res.status(400).json({ errorMessage: 'UNAUTHORIZED' })
  }
  const body = req.body
  if (!body) return res.status(400).json({ success: false, error: 'You must provide a body to update' })

  try {
    const list = await db.getPlaylistById(req.params.id)
    if (!list) return res.status(404).json({ message: 'Playlist not found!' })

    const owner = await db.getUserByEmail(list.ownerEmail)
    if (!owner || String(owner._id || owner.id) !== String(req.userId)) {
      return res.status(400).json({ success: false, description: 'authentication error' })
    }

    const updated = await db.updatePlaylistById(req.params.id, {
      name: body.playlist.name,
      songs: body.playlist.songs,
    })

    return res.status(200).json({ success: true, id: updated._id || updated.id, message: 'Playlist updated!' })
  } catch (error) {
    return res.status(404).json({ error, message: 'Playlist not updated!' })
  }
}

module.exports = {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylistPairs,
  getPlaylists,
  updatePlaylist,
}
