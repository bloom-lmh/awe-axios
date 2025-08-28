import { defineConfig } from 'vite';
import path from 'path';
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 将 @ 映射到 src 目录
      '@stateManager': path.resolve(__dirname, 'src/core/managers/state'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@factories': path.resolve(__dirname, 'src/core/factories'),
      '@decorators': path.resolve(__dirname, 'src/core/decorators'),
      '@templates': path.resolve(__dirname, 'src/core/templates'),
      '@processors': path.resolve(__dirname, 'src/core/processors'),
      '@configValidators': path.resolve(
        __dirname,
        'src/core/validators/configValidators'
      ),
      '@decoratorValidators': path.resolve(
        __dirname,
        'src/core/validators/decoratorValidators'
      ),
    },
  },
});
