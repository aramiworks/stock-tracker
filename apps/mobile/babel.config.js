module.exports = function (api) {
  api.cache(true);

  const plugins =
    process.env.NODE_ENV === "test"
      ? []
      : [
          [
            "@tamagui/babel-plugin",
            {
              components: ["tamagui", "@aramiworks/ui"],
              config: "./src/lib/tamagui/tamagui.config.ts",
              logTimings: true,
            },
          ],
        ];

  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
