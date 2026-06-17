import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    name: "frontend-realms/custom",
    rules: {},
  },
];

export default eslintConfig;
