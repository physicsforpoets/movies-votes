# frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

**Note**: By default, the app connects to the API at `http://localhost:3000/api`.

To access the app from another device on your home network:

1. Find your computer's IP address on your network (e.g., `192.168.1.100`)
2. Create a `.env.local` file in the frontend directory:
   ```bash
   echo "VITE_API_BASE_URL=http://YOUR_IP_ADDRESS:3000/api" > .env.local
   ```
3. Replace `YOUR_IP_ADDRESS` with your actual IP
4. Restart the dev server
5. Access the app from other devices using your computer's IP address

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
