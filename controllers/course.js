import AWS from "aws-sdk";
import Course from "../models/course";
import User from "../models/user";
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

export const update = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({ slug }).exec();

    if (req.auth._id != course.provider) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findOneAndUpdate({ slug }, req.body, {
      new: true,
    }).exec();

    res.json(updated);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Update course failed");
  }
};

export const removeModule = async (req, res) => {
  try {
    const { slug, moduleId } = req.params;
    const course = await Course.findOne({ slug }).exec();

    if (req.auth._id != course.provider) {
      return res.status(400).send("Unauthorized");
    }

    const deleted = await Course.findByIdAndUpdate(course._id, {
      $pull: { modules: { _id: moduleId } },
    }).exec();

    res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).send("Delete module failed");
  }
};

export const updateModule = async (req, res) => {
  try {
    const { slug } = req.params;
    const { _id, title, content, video, free_preview } = req.body;
    const course = await Course.findOne({ slug }).select("provider").exec();

    if (req.auth._id != course.provider._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.updateOne(
      { "modules._id": _id },
      {
        $set: {
          "modules.$.title": title,
          "modules.$.content": content,
          "modules.$.video": video,
          "modules.$.free_preview": free_preview,
        },
      },
      { new: true }
    ).exec();
    res.json({ ok: true });
  } catch (error) {
    console.log(error);
    return res.status(400).send("Update module failed");
  }
};

export const publish = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).select("provider").exec();
    if (req.auth._id != course.provider._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findByIdAndUpdate(
      courseId,
      { published: true },
      { new: true }
    ).exec();
    res.json(updated);
  } catch (error) {
    console.log(error);
    return req.status(400).send("Publish course failed");
  }
};

export const unpublish = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).select("provider").exec();
    if (req.auth._id != course.provider._id) {
      return res.status(400).send("Unauthorized");
    }

    const updated = await Course.findByIdAndUpdate(
      courseId,
      { published: false },
      { new: true }
    ).exec();
    res.json(updated);
  } catch (error) {
    console.log(error);
    return req.status(400).send("Unpublish course failed");
  }
};

export const courses = async (req, res) => {
  const allCourses = await Course.find({ published: true })
    .populate("provider", "_id name")
    .exec();
  res.json(allCourses);
};

export const checkEnrollment = async (req, res) => {
  const { courseId } = req.params;

  const user = await User.findById(req.auth._id).exec();

  let ids = [];
  let length = user.courses && user.courses.length;
  for (let i = 0; i < length; i++) {
    ids.push(user.courses[i].toString());
  }
  res.json({
    status: ids.includes(courseId),
    course: await Course.findById(courseId).exec(),
  });
};

export const freeEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).exec();
    if (course.paid) return;

    const result = await User.findByIdAndUpdate(
      req.auth._id,
      {
        $addToSet: { courses: course._id },
      },
      { new: true }
    ).exec();
    console.log(result);
    res.json({
      message: "Congratulations! You have successfully enrolled",
      course,
    });
  } catch (err) {
    console.log("free enrollment err", err);
    return res.status(400).send("Enrollment create failed");
  }
};

export const paidEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("provider")
      .exec();
    if (!course.paid) return;

    const fee = (course.price * 30) / 100;
    res.json({ ok: true });
  } catch (err) {
    console.log("PAID ENROLLMENT ERR", err);
    return res.status(400).send("Enrollment create failed");
  }
};

export const userCourses = async (req, res) => {
  const user = await User.findById(req.auth._id).exec();
  const courses = await Course.find({ _id: { $in: user.courses } })
    .populate("provider", "_id name")
    .exec();
  res.json(courses);
};
