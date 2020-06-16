const db = require('../db.js');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;

class User {
  constructor (name, email, password) {
    this.password = password;
    this.email = email;
    this.name = name;
  }
  
  static async create (name, email, password) {
    const hash = await argon2.hash(password);
    return db.query('INSERT INTO users (name, email, encrypted_password) VALUES (?, ?, ?)', [name, email, hash])
    .then(res => { 
      return {id : res.insertId, name, email}
    })
  }

  static async findById (id) {
    return db.query(`SELECT * FROM users WHERE id = ?`, [id] )
    .then(rows => {
      if (rows.length) {
        return Promise.resolve(rows[0]) 
      } else {
        const err = new Error();
        err.kind = 'Pas de chance, rien de trouvé !';
        return Promise.reject(err);
      }
    })
    
  }

  static async findByEmail (email) {
    return db.query(`SELECT * FROM users WHERE email = ?`, [email])
    .then(rows => {
      if (rows.length) {
        return Promise.resolve(rows[0]);
      } else {
        const err = new Error();
        console.log(`Aucun e-mail correspond à ${email}`)
        return Promise.reject(err);
      }
    });
  }
  
  static async login(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found !');
    } else {
      const passwordMatch = await argon2.verify(user.encrypted_password, password);
        if (passwordMatch) {
          const token = jwt.sign({ id: user.id, sub: user.name }, JWT_PRIVATE_KEY);
          return Promise.resolve(token);
        } else {
          throw new Error('Password is not matching.')
        }
    }
  }
}

module.exports = User;
