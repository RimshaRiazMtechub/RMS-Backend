const { pool } = require("../../config/db.config");

exports.create_type = async (req, res) => {
  const { full_name } = req.body;
  const client = await pool.connect();
  try {
    const existingUser = await pool.query(
      `SELECT * FROM payment_terms_types WHERE full_name = $1`,
      [full_name]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: true,
        message: "Payment Terms already exists",
      });
    }
    const userData = await pool.query(
      `INSERT INTO payment_terms_types(full_name) VALUES($1) returning *`,
      [full_name]
    );
    res.status(201).json({
      error: false,
      message: "Payment Terms created successfully",
      data: userData.rows[0],
    });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      // Unique constraint error
      res.status(409).json({
        error: true,
        error_obj: err,
        message: "Payment Terms already exists",
      });
    } else {
      res.status(500).json({
        error: true,
        error_obj: err,
        message: "Internal server error",
      });
    }
  } finally {
    client.release();
  }
};
exports.update_type = async (req, res) => {
  const { full_name } = req.body;
  const { id } = req.params;
  const client = await pool.connect();
  try {
    let updateQuery = "UPDATE payment_terms_types SET ";
    let updateValues = [];
    let index = 1;

    if (full_name) {
      updateQuery += `full_name=$${index}, `;
      updateValues.push(full_name);
      index++;
    }

    // Remove the last comma and space
    updateQuery = updateQuery.slice(0, -2);

    updateQuery += ` WHERE payment_terms_type_id=$${index} returning *`;
    updateValues.push(id);

    const userData = await pool.query(updateQuery, updateValues);

    if (userData.rowCount === 0) {
      res.status(404).json({ error: true, message: "Payment Terms not found" });
    } else {
      res.status(200).json({
        error: false,
        message: "Terms updated successfully",
        data: userData.rows[0],
      });
    }
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      // Unique constraint error
      res
        .status(409)
        .json({ error: true, error_obj: err, message: "Terms already in use" });
    } else {
      res.status(500).json({
        error: true,
        error_obj: err,
        message: "Internal server error",
      });
    }
  } finally {
    client.release();
  }
};
// delete user
exports.delete_type = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const userData = await pool.query(
      "DELETE FROM payment_terms_types WHERE payment_terms_type_id=$1 returning *",
      [id]
    );
    if (userData.rowCount === 0) {
      res.status(404).json({ error: true, message: "Payment Terms not found" });
    } else {
      res
        .status(200)
        .json({ error: false, message: "Payment Term deleted successfully" });
      // Invalidate cache for this user
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: true, error_obj: err, message: "Internal server error" });
  } finally {
    client.release();
  }
};
// get all users
// get all users
exports.get_all_types = async (req, res) => {
  try {
    // const page = req.query.page;
    // const limit = req.query.limit;
    let userData;

    userData = await pool.query(
      "SELECT * FROM payment_terms_types ORDER BY payment_terms_type_id"
    );
    return res.status(200).json({
      error: false,
      message: "Payment Terms fetched successfully",
      data: userData.rows,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: true, error_obj: err, message: "Internal server error" });
  }
};
// get user by id
exports.get_type_by_id = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const userData = await pool.query(
      "SELECT * FROM payment_terms_types WHERE payment_terms_type_id=$1",
      [id]
    );
    if (userData.rowCount === 0) {
      res.status(404).json({ error: true, message: "Payment term not found" });
    } else {
      res.status(200).json({
        error: false,
        message: "Payment Term fetched successfully",
        data: userData.rows[0],
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: true, error_obj: err, message: "Internal server error" });
  } finally {
    client.release();
  }
};
