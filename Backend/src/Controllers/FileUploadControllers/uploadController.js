import { bucket } from "../../Config/firebase.js";

export const uploadFileToFirebase = async (file, path) => {
  const fileUpload = bucket.file(path);

  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  });

  return path; // we return path, NOT public URL
};
