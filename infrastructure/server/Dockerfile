FROM oven/bun:1 AS build
WORKDIR /repo
COPY . .
RUN bun install --frozen-lockfile && bun run build:server

FROM public.ecr.aws/lambda/nodejs:22

COPY --from=build /repo/server/.output ${LAMBDA_TASK_ROOT}

CMD ["server/index.handler"]
