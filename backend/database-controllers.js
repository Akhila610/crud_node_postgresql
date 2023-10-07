const Pool = require('pg').Pool
const bcrypt = require('bcrypt');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'userdatabase',
  password: 'akhila@123',
  port: 5432,
})

const pgp = require('pg-promise')();
const db = pgp({
  user: 'postgres',
  host: 'localhost',
  database: 'userdatabase',
  password: 'akhila@123',
  port: 5432,
});

const getUsers = async(request, response) => {
  const page = parseInt(request.query.page) || 1;
  const perPage = parseInt(request.query.perPage) || 10;
  const offset = (page - 1) * perPage;
  try {
    // Query to retrieve users with pagination
    const users = await db.any(
      'SELECT * FROM users LIMIT $1 OFFSET $2',
      [perPage, offset]
    );

    response.json(users);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal Server Error' });
  }

 /* pool.query('SELECT * FROM users LIMIT 10', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })*/
}
const getUserById = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }


  const login =async(username,password)=>{
    try{
      const query = {
        text: 'SELECT * FROM users WHERE username = $1 and password = $2',
        values: [username,password],
      };
      const result =  await pool.query(query);
      return result.rows
    }
      catch (error) {
        console.error('Login error:', error);
       return error
    }
    /*const query = {
      text: 'SELECT * FROM users WHERE username = $1 and password = $2',
      values: [username,password],
    };
      await pool.query(query)
      .then((result) => {
      console.log(`reult: ${JSON.stringify(result.rows)}`);
      return result;
    })
    .catch((error) => {
      console.log(error);
      return error;
    })
*/
  }

  const getUserWithID = (id) => {
    const userid = parseInt(request.params.id)
    pool.query('SELECT * FROM users WHERE id = $1', [userid], (error, results) => {
      if (error) {
        throw error
      }
      return results.rows
      //response.status(200).json(results.rows)
    })
  }

  
  const loginUser=async(req,res)=>{
    const resultJs = {};
    try {
      const { username, password } = req.body;
      console.log(username);
      console.log(password);
  
      const query = {
        text: 'SELECT * FROM users WHERE username = $1',
        values: [username],
      };
      const result =  await pool.query(query);
      console.log(JSON.stringify(result.rows))
      if (result.rows.length === 0) {
        console.log(" inside result rows ")
        resultJs["message"] = "User not found"
        resultJs["data"] = ""
         res.send(resultJs);
      }
      const user = result.rows[0];
      console.log(user)
      console.log("user password "+ user.password)
      console.log(password)
      //const passwordMatch = await bcrypt.compare(password, user.password);
     // console.log("match or not "+passwordMatch)

      
      if (password != user.password) {
        resultJs["message"] = "User not found"
         res.send(resultJs);
      }else{
        resultJs["message"] = "login successfully";
        resultJs["data"] = user
      return res.send(resultJs);
      }
        
    } catch (error) {
      console.error('Login error:', error);
      resultJs["message"] = "Login failed"
      return res.send(resultJs);
    }

  }
  const createUser = (request, response) => {
    console.log("etenred here")
    console.log(request.body);
    const requestJson = request.body
    console.log(requestJson.password)
    const hashedPassword = requestJson.password
    //const hashedPassword =  bcrypt.hash(requestJson.password, 10);
    //console.log("hased passwoed "+ hashedPassword)
    const fullname = requestJson.fullname;
    const username = requestJson.username;
    let role = requestJson.role;
    if(role == ""){
     role = "user"
    }

  pool.query('INSERT INTO users (fullname,username,password,role) VALUES ($1,$2,$3,$4)', [fullname, username,hashedPassword,role], (error, results) => {
      if (error) {
        throw error
      }
      console.log(JSON.stringify(results))
      response.status(201).send(`User added with ID: ${results.insertId}`)
    })
  }
  //app.post('/insert-and-fetch', async (req, res) => {
    const insertfetch = async(req,res) => {
  try {
      const { fullname, username, password, role } = req.body;
  
      // Use pg-promise's db.one method to execute the INSERT statement with RETURNING
      const insertedUser = await db.one(
        'INSERT INTO users (fullname, username, password, role) VALUES ($1, $2, $3, $4) RETURNING id, fullname, username, password, role',
        [fullname, username, password, role]
      );
      // Return the inserted data as a response
      console.log("insert user"+insertedUser)
      res.status(201).json(insertedUser);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  //});
  const updateUser =async (request, response) => {
    const id = parseInt(request.params.id)
    const { fullname,username,role } = request.body
    try {
      const query = {
        text: `
          UPDATE users
          SET fullname = $2, username = $3,role=$4
          WHERE id = $1
          RETURNING *
        `,
        values: [id, fullname, username,role],
      };
  
      const result = await pool.query(query);
      console.log("result in update user"+JSON.stringify(result.rows[0]))
      const row = result.rows[0]
      console.log(row.role)
      //return JSON.stringify(result.rows[0]); // The first row returned by RETURNING
      response.json(row);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  const deleteUser =async (request, response) => {
    const id = parseInt(request.params.id)
    console.log(id)
    try {
      const query = {
        text: `
          DELETE FROM users
          WHERE id = $1
          RETURNING *
        `,
        values: [id],
      };
  
      const result = await pool.query(query);
      console.log("result js ----->"+result.rows[0])
      response.json(result.rows[0])  // The first row returned by RETURNING
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }


  const deleteUser1 = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User deleted with ID: ${id}`)
    })
  }
  
  module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    login,
    getUserWithID,
    insertfetch,
  }