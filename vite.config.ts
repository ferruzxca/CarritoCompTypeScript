// vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/",              // Pages usa raíz
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        index:   resolve(__dirname, "index.html"),
        products: resolve(__dirname, "products.html"),
        cart:     resolve(__dirname, "cart.html"),
        checkout: resolve(__dirname, "checkout.html"),
        login:    resolve(__dirname, "login.html"),
        thanks:   resolve(__dirname, "thanks.html"),
      },
    },
  },
});
