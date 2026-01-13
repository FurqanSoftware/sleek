import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
  input: "js/index.js",
  output: {
    file: "dist/js/sleek.js",
    format: "esm",
  },
  plugins: [
    babel({
      babelHelpers: "bundled",
    }),
    nodeResolve(),
  ],
};
