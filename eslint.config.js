const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  { ignores: ["dist/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name=/^(borderWidth|borderColor|borderRadius|borderTopWidth|borderBottomWidth|borderLeftWidth|borderRightWidth|borderBottomLeftRadius|padding|paddingHorizontal|paddingVertical|paddingTop|paddingBottom|paddingLeft|paddingRight|margin|marginHorizontal|marginVertical|marginTop|marginBottom|marginLeft|marginRight|fontSize|fontWeight|fontFamily|alignItems|justifyContent|alignSelf|flexWrap)$/]",
          message:
            "Use the configured Tamagui shorthand instead of a longhand styling prop.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              importNames: ["StyleSheet"],
              message: "Use Tamagui components and styling props instead.",
            },
          ],
        },
      ],
    },
  },
]);
