import pkg from "./package.json";

const input = "src/index.js";
const banner =
`/*
 * CircularSliders.js
 * ${pkg.description}
 * ${pkg.repository.url}
 * v${pkg.version}
 * ${pkg.license} License
 */
`;

export default [
  {
    input: input,
    output: {
      name: 'CircularSliders',
      file: pkg.main,
      format: 'umd',
      banner: banner
    }
  },
  {
    input: input,
    output: {
      file: pkg.module,
      format: "es",
      banner: banner
    }
  }
];
