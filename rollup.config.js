import pkg from "./package.json";

const banner =
`/*
 * CircularSliders.js
 * ${pkg.description}
 * ${pkg.repository.url}
 * v${pkg.version}
 * ${pkg.license} License
 */
`;

export default {
  input: 'src/index.js',
  output: {
    name: 'CircularSliders',
    file: pkg.main,
    format: 'umd',
    banner: banner
  }
};
