# ---- 构建阶段：一次全量安装（含 devDependencies），避免二次 install 死锁 ---- 
FROM node:20-slim AS build
ENV NODE_ENV=development
WORKDIR /app

# 启用 corepack 并固定 pnpm 版本（与本地一致，避免 frozen-lockfile 校验失败）
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# 仅复制依赖清单以利用缓存（patches 已移除，无需再复制）
COPY package.json pnpm-lock.yaml ./
COPY server/package.json server/package.json

# 全量安装（含 devDependencies：@nestjs/cli / typescript 均为构建必需）
# --prod=false 显式确保门禁无论注入何种 NODE_ENV 都装全部依赖
RUN pnpm install --frozen-lockfile --prod=false

# 复制源码（含 .cozeproj 构建脚本，已在 .dockerignore 放开）
COPY . .

# 构建前端（Taro H5）与后端（NestJS）
RUN pnpm build:web
RUN pnpm build:server

EXPOSE 3000

# ---- 运行阶段：直接复用构建产物，不再二次安装依赖 ----
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# 复制构建产物与完整 node_modules（含 server 依赖）
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/dist-web ./dist-web
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/server/package.json /app/server/package.json

# 启动后端服务（自动托管前端静态资源）
CMD ["node", "/app/server/dist/main.js"]