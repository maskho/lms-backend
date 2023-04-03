import mongoose from "mongoose";

const { Schema } = mongoose;

const { ObjectId } = Schema;

const moduleSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    content: {
      type: {},
      minLength: 200,
    },
    video: {},
    free_preview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const courseSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: {},
      minLength: 200,
      required: true,
    },
    price: {
      type: Number,
      default: 500000,
    },
    image: {},
    category: String,
    published: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: true,
    },
    provider: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    modules: [moduleSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
