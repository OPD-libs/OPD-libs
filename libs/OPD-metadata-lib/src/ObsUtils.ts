import { stringifyYaml } from 'obsidian';

export function stringifyFrontmatter(frontmatter: any) {
	return `---\n${stringifyYaml(frontmatter)}---`;
}
