# Project Instructions: Instagram Clone (MERN)

## 1. Create main folder and open it

```
mkdir instagram-clone
cd instagram-clone
# (Then open this folder in VSCode)
```

## 2. Create folders and initialize backend

```sh
mkdir backend frontend
cd backend
npm init -y .
```

- Add `"type": "module"` to the root of the `package.json` file in backend.
- Create an empty `index.js` file in the backend folder (already present).

## 3. Install backend dependencies

```sh
cd backend
npm i express mongoose jsonwebtoken bcryptjs cors cookie-parser dotenv
npm i -D nodemon
```

- Update the `scripts` section in `package.json` to:
  ```json
  "scripts": {
    "dev": "nodemon index.js"
  }
  ```

---

## 4. Set up Cloudinary for image uploads

1. Go to [Cloudinary Console](https://console.cloudinary.com/) and sign up or log in.
2. In your Cloudinary dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Install the Cloudinary SDK in your backend:
   ```sh
   npm install cloudinary
   ```
4. Create a config file at `backend/config/cloudinary.js`:
   ```js
   import { v2 as cloudinary } from 'cloudinary';
   import dotenv from 'dotenv';
   dotenv.config();

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   export default cloudinary;
   ```
5. Add your Cloudinary credentials to your `.env` file:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
6. To upload an image in your backend controller:
7. Install the `datauri` package (for handling file uploads as Data URLs):
   ```sh
   cd backend
   npm i datauri
   ```
   ```js
   import cloudinary from '../config/cloudinary.js';

   const result = await cloudinary.uploader.upload(filePath, {
     folder: 'instagram-clone',
   });
   ```

---
