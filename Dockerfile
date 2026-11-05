# ---- 构建阶段 ----
FROM node:20-slim AS build
WORKDIR /app

# 启用 corepack 提供 pnpm
RUN corepack enable

# 仅复制依赖清单以利用缓存
COPY package.json pnpm-lock.yaml ./
COPY server/package.json server/package.json

RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建前端（Taro H5）与后端（NestJS）
RUN pnpm build:web
RUN pnpm build:server

EXPOSE 3000

# ---- 运行阶段 ----
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN corepack enable

# 复制构建产物与运行所需
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/dist-web ./dist-web
COPY --from=build /app/.coze ./ 2>/dev/null || true
COPY --from=build /app/node_modules ./node_modules

# 启动后端服务（自动托管前端静态资源）
CMD ["node", "server/dist/main.js"]