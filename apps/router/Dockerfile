FROM ghcr.io/apollographql/router:v2.10.0

COPY apps/router/router.yaml /dist/config/router.yaml
COPY apps/router/rhai/ /dist/config/rhai/

EXPOSE 4002

CMD ["--config", "/dist/config/router.yaml", "--log", "warn"]
