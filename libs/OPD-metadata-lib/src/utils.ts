import {stringifyYaml} from 'obsidian';

export default function stringifyFrontmatter(frontmatter: any) {
    return `---\n${stringifyYaml(frontmatter)}---`;
}
