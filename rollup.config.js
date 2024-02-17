import babel from '@rollup/plugin-babel';
import nodeRoles from '@rollup/plugin-node-resolve';

export default {
	input: 'src/index.js',
	output: {
        file: 'dist/sleek.js',
		format: 'es'
	},
	plugins: [
		babel({
			babelHelpers: 'bundled'
		}),
        nodeRoles()
	]
}
