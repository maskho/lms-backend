import AWS from "aws-sdk";
import Course from "../models/course";
import slugify from "slugify";
import { readFileSync } from "fs";
const nanoid = require("nanoid");

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const S3 = new AWS.S3(awsConfig);

export const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).send("No image");

    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1];

    const params = {
      Bucket: "kobar-lms-bucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (error) {
    console.log(error);
  }
};

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;
    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };

    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }
      res.send({ ok: true });
    });
  } catch (error) {
    console.log(error);
  }
};

export const create = async (req, res) => {
  try {
    const courseExist = await Course.findOne({
      slug: slugify(req.body.name.toLowerCase()),
    });
    if (courseExist) return res.status(400).send("Title is taken.");

    const course = await new Course({
      slug: slugify(req.body.name),
      provider: req.auth._id,
      ...req.body,
    }).save();

    res.json(course);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Course create failed! Try again.");
  }
};

export const read = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("provider", "_id name")
      .exec();
    res.json(course);
  } catch (error) {
    console.log(error);
  }
};

export const uploadVideo = async (req, res) => {
  try {
    if (req.auth._id != req.params.providerId) {
      return res.status(400).send("Unauthorized");
    }

    const { video } = req.files;
    if (!video) return res.status(400).send("No video");

    const params = {
      Bucket: "kobar-lms-bucket",
      Key: `${nanoid()}.${video.type.split("/")[1]}`,
      Body: readFileSync(video.path),
      ACL: "public-read",

      ContentType: video.type,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send(data);
    });
  } catch (error) {
    console.log(error);
  }
};

export const removeVideo = async (req, res) => {
  try {
    if (req.auth._id != req.params.providerId) {
      return res.status(400).send("Unauthorized");
    }

    const { Bucket, Key } = req.body;

    const params = {
      Bucket: Bucket,
      Key: Key,
    };

    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      console.log(data);
      res.send({ ok: true });
    });
  } catch (error) {
    console.log(error);
  }
};

export const addModule = async (req, res) => {
  try {
    const { slug, providerId } = req.params;
    const { title, content, video } = req.body;

    if (req.auth._id != providerId) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate(
      { slug },
      { $push: { modules: { title, content, video, slug: slugify(title) } } },
      { new: true }
    )
      .populate("provider", "_id name")
      .exec();
    res.json(updated);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Add module failed");
  }
};
