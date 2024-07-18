var express = require("express");
var router = express.Router();

// import model
const Distributors = require("../models/distributors");
const Fruits = require("../models/fruits");
const Users = require("../models/users");

// import file upload
const Upload = require("../config/common/upload");

// import  file Transporter
const Transporter = require("../config/common/mail");

router.post("/add-distributor", async (req, res) => {
  try {
    const data = req.body;
    const newDistributors = new Distributors({
      name: data.name,
    });
    const result = await newDistributors.save();
    if (result) {
      res.json({
        status: 200,
        messenger: "them thanh cong",
        data: result,
      });
    } else {
      res.json({
        status: 400,
        messenger: "them khong thanh cong",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//get list fruit
router.get("/get-list-fruit", async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  let payload;

  JWT.verify(token, SECRETKEY, (err, _payload) => {
    if (err instanceof JWT.TokenExpiredError) {
      return res.sendStatus(401);
    }
    if (err) {
      return res.sendStatus(403);
    }
    payload = _payload;
  });
  console.log(payload);
  

  try {
    const data = await Fruits.find().populate("id_distributor");
    res.json({
      status: 200,
      messenger: "danh sach fruit",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

//get fruit by id
router.get("/get-fruit-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Fruits.findById(id).populate("id_distributor");
    res.json({
      status: 200,
      messenger: "fruit by id",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

//get fruit in price
router.get("/get-list-fruit-in-price", async (req, res) => {
  try {
    const { price_start, price_end } = req.query;

    const query = { price: { $gte: price_start, $lte: price_end } };

    const data = await Fruits.find(query, "name quantity price id_distributor")
      .populate("id_distributor")
      .sort({ quantity: -1 })
      .skip(0)
      .limit(2);

    res.json({
      status: 200,
      messenger: "danh sach fruit",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

//get fruit have name "a" or "x"
router.get("/get-list-fruit-have-name-a-or-x", async (req, res) => {
  try {
    const query = {
      $or: [{ name: { $regex: "A" } }, { name: { $regex: "X" } }],
    };

    const data = await Fruits.find(
      query,
      "name quantity price id_distributor"
    ).populate("id_distributor");

    res.json({
      status: 200,
      messenger: "danh sach fruit",
      data: data,
    });
  } catch (error) {
    console.log(error);
  }
});

// add fruit
router.post("/add-fruit", async (req, res) => {
  try {
    const data = req.body;
    const newFruit = new Fruits({
      name: data.name,
      quantity: data.quantity,
      price: data.price,
      status: data.status,
      image: data.image,
      description: data.description,
      id_distributor: data.id_distributor,
    });
    const result = await newFruit.save();
    if (result) {
      res.json({
        status: 200,
        messenger: "them thanh cong",
        data: result,
      });
    } else {
      res.json({
        status: 400,
        messenger: "them khong thanh cong",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// put fruit
router.put("/update-fruit-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatefruit = await Fruits.findById(id);
    let result = null;

    if (updatefruit) {
      updatefruit.name = data.name ?? updatefruit.name;
      updatefruit.quantity = data.quantity ?? updatefruit.quantity;
      updatefruit.price = data.price ?? updatefruit.price;
      updatefruit.status = data.status ?? updatefruit.status;
      updatefruit.image = data.image ?? updatefruit.image;
      updatefruit.description = data.description ?? updatefruit.description;
      updatefruit.id_distributor =
        data.id_distributor ?? updatefruit.id_distributor;
      result = await updatefruit.save();
    }

    if (result) {
      res.json({
        status: 200,
        messenger: "update thanh cong",
        data: result,
      });
    } else {
      res.json({
        status: 400,
        messenger: "update that bai",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
  }
});

//delete fruit
router.delete("/delete-fruit-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Fruits.findByIdAndDelete(id);
    if (result) {
      res.json({
        status: 200,
        messenger: "delete thanh cong",
        data: result,
      });
    } else {
      res.json({
        status: 200,
        messenger: "delete that bai",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// add fruit with file/files image
router.post(
  "/add-fruit-with-file-image",
  Upload.array("image", 5),
  async (req, res) => {
    try {
      const data = req.body;
      const files = req.files;
      const urlsImage = files.map(
        (file) =>
          `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
      );

      const newfruit = new Fruits({
        name: data.name,
        quantity: data.quantity,
        price: data.price,
        status: data.status,
        image: urlsImage,
        description: data.description,
        id_distributor: data.id_distributor,
      });
      const result = await newfruit.save();
      if (result) {
        res.json({
          status: 200,
          messenger: "them thanh cong",
          data: result,
        });
      } else {
        res.json({
          status: 200,
          messenger: "them that bai",
          data: [],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// send email when register
router.post(
  "/register-send-email",
  Upload.single("avatar"),
  async (req, res) => {
    try {
      const data = req.body;
      const { file } = req;

      const newUser = Users({
        username: data.username,
        password: data.password,
        email: data.email,
        name: data.name,
        avatar: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        available: data.available,
      });

      const result = await newUser.save();
      if (result) {
        const mailOption = {
          from: "hungnguyenisme84@gmail.com",
          to: result.email,
          subject: "dang ki thanh cong",
          text: "cam on ban da dang ki",
        };
        await Transporter.sendMail(mailOption);

        res.json({
          status: 200,
          messenger: "them thanh cong",
          data: result,
        });
      } else {
        res.json({
          status: 200,
          messenger: "them that bai",
          data: [],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
);

// json web token
const JWT = require("jsonwebtoken");
const SECRETKEY = "FPTPOLYTECHNIC";
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username, password });

    if (user) {
      const token = JWT.sign({ id: user._id }, SECRETKEY, { expiresIn: "1h" });
      const refreshToken = JWT.sign({ id: user._id }, SECRETKEY, {
        expiresIn: "1h",
      });

      res.json({
        status: 200,
        messenger: "dang nhap thanh cong",
        data: user,
        token: token,
        refreshToken: refreshToken,
      });
    } else {
      res.json({
        status: 400,
        messenger: "loi, dang nhap khong thanh cong",
        data: [],
      });
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
