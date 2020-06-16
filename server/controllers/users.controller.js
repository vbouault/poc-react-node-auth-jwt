const User = require('../models/user.model.js');

class usersController {
  static async create (req, res) {
    const {name, email, password} = req.body;
    if (!name || !email || !password ) {
      return res.status(400).send ({error : 'Remplis le champs bordel'})
    }
    try {
      const data = await User.create(name, email, password);
      return res.status(201).send(data);
    }
    catch(err) {
      return res.send(err);
    }
  }
}

module.exports = usersController;
