const { User, Tweet, Reply, Like } = require('../models')

const tweetController = {
  getTweets: async (req, cb) => {
    try {
      const tweets = await Tweet.findAll({
        include: [
          {
            model: User,
            attributes: { exclude: ['password'] }
          }
        ],
        raw: true,
        nest: true
      })
      return cb(null, tweets)
    } catch (err) {
      return cb(err)
    }
  },
  getTweet: async (req, cb) => {
    try {
      const tweet = await Tweet.findByPk(req.params.tweet_id, {
        include: [
          {
            model: User,
            attributes: { exclude: ['password'] }
          }
        ],
        raw: true,
        nest: true
      })
      if (!tweet) {
        return cb(new Error('tweet_id does not exist.'))
      }
      const Replies = await Reply.findAll({
        raw: true,
        nest: true,
        where: { TweetId: req.params.tweet_id }
      })

      tweet.Reply = Replies

      return cb(null, tweet)
    } catch (err) {
      return cb(err)
    }
  },
  postTweet: async (req, cb) => {
    try {
      const { description } = req.body
      const UserId = req.user?.id || null
      if (!description) {
        return cb(new Error('Description is required.'))
      } else if (description.length > 140) {
        return cb(new Error('Description is longer than 140 words.'))
      }
      const newTweet = await Tweet.create({
        description,
        UserId
      })
      const tweetData = {
        status: 'success',
        data: {
          Tweet: newTweet.dataValues
        }
      }
      return cb(null, tweetData)
    } catch (err) {
      return cb(err)
    }
  },
  postLike: async (req, cb) => {
    try {
      const UserId = req.user?.id
      const TweetId = req.params.id
      const tweet = await Tweet.findByPk(TweetId)
      if (!tweet) {
        return cb(new Error('tweet_id does not exist.'))
      }

      const findLike = await Like.findOne({
        where: {
          UserId,
          TweetId
        }
      })

      if (findLike) {
        return cb(new Error('This tweet is already liked.'))
      }

      const newLike = await Like.create({
        UserId,
        TweetId
      })

      const likeData = {
        status: 'success',
        data: {
          Like: newLike.dataValues
        }
      }
      return cb(null, likeData)
    } catch (err) {
      return cb(err)
    }
  },
  postUnlike: async (req, cb) => {
    try {
      const UserId = req.user?.id
      const TweetId = req.params.id
      const tweet = await Tweet.findByPk(TweetId)
      if (!tweet) {
        return cb(new Error('tweet_id does not exist.'))
      }

      const findLike = await Like.findOne({
        where: {
          UserId,
          TweetId
        }
      })
      if (!findLike) {
        return cb(new Error('This tweet is not liked.'))
      }
      const deletedLike = await findLike.destroy()

      const likeData = {
        status: 'success',
        data: {
          Like: deletedLike.dataValues
        }
      }
      return cb(null, likeData)
    } catch (err) {
      return cb(err)
    }
  }
}
module.exports = tweetController
