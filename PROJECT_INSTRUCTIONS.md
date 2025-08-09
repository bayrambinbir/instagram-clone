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
