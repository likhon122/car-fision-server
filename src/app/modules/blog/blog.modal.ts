import { model, Schema } from "mongoose";
import { TBlog } from "./blog.interface";


const blogSchema = new Schema<TBlog>(
    {
      
      id: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

  const Blogs = model<TBlog>("blogs", blogSchema);

export default Blogs;
