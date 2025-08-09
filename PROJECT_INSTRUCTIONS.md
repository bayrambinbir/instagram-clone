# Project Instructions: Instagram Clone (MERN)

## 1. Create main folder and open it

```
mkdir instagram-clone
cd instagram-clone
# (Then open this folder in VSCode)
```

## 2. Create two folders

```
mkdir backend frontend
```

## 3. Initialize backend with npm

```
cd backend
npm init -y .
```

## 4. Update package.json

- Add "type": "module" to the root of the package.json file in backend.

## 5. Add index.js to backend folder

- Create an empty `index.js` file in the backend folder (already present).

## 6. Install backend dependencies

```
cd backend
npm i express mongoose jsonwebtoken bcryptjs cors
```

## 7. Install nodemon as a dev dependency

```
cd backend
npm i -D nodemon
```

## 8. Update scripts in package.json

Replace the existing `scripts` section with:

```
  "scripts": {
    "dev": "nodemon index.js"
  }
```

## 9. Install cookie-parser

```
cd backend
npm i cookie-parser
```

---


