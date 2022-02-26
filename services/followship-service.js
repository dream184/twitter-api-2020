const { User, Followship } = require('../models')

const followshipController = {
  addFollowing: async (req, cb) => {
    try {
      const followerId = req.user?.id
      const followingId = req.body.id

      if (followerId === followingId) {
        return cb(new Error('The user cannot follow himself / herself.'))
      }
      const followingUser = await User.findByPk(followingId)
      if (!followingUser) {
        return cb(new Error('The user who wants to follow does not exist.'))
      }

      const currentUser = await User.findByPk(followerId)
      if (!currentUser) {
        return cb(new Error('The user does not exist.'))
      }

      const checkedFollowships = await Followship.findAll({
        where: {
          followerId,
          followingId
        }
      })

      if (checkedFollowships.length > 0) {
        return cb(new Error('The followship already exist.'))
      }
      const newFollowship = await Followship.create({
        followerId,
        followingId
      })
      const followshipData = {
        status: 'success',
        data: {
          Followship: newFollowship
        }
      }
      return cb(null, followshipData)
    } catch (err) {
      return cb(err)
    }
  }

}

module.exports = followshipController
