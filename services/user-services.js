const jwt = require('jsonwebtoken')
const { User } = require('../models')
const bcrypt = require('bcryptjs')

const userController = {
  signUp: async (req, cb) => {
    try {
      if (req.body.password !== req.body.checkPassword) throw new Error('Passwords do not match!')
      const user = await User.findOne({ where: { email: req.body.email } })
      if (user) throw new Error('Email already exists!')
      const hash = await bcrypt.hash(req.body.password, 10)
      const newUser = await User.create({
        account: req.body.account,
        name: req.body.name,
        email: req.body.email,
        password: hash
      })
      const userData = {
        status: "suceess",
        data: {
          user: {
            id: newUser.id,
            account: newUser.account,
            name: newUser.name,
            email: newUser.email,
          }
        }
      }
      return cb(null, { userData })
    } catch (err) {
      return cb(err)
    }
  },
  signIn: (req, cb) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password
      const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' })
      const tokenData = {
        status: 'success',
        data: {
          token,
          user: userData
        }
      }
      return cb(null, { tokenData })
    } catch (err) {
      return cb(err)
    }
  },
  getUser: async (req, cb) => {
    try {
      const user = await User.findByPk(req.params.id, {
        raw: true,
        nest: true
      })
      const userData = {
        status: 'success',
        data: {
          id: user.id,
          name: user.name,
          account: user.account,
          email: user.email
        }
      }
      return cb(null, { userData })
    } catch (err) {
      cb(err)
    }
  }
}
module.exports = userController