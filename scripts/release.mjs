import { appendFileSync } from 'node:fs';
import semanticRelease from 'semantic-release';

// Use semantic-release's result rather than guessing from tags already at HEAD.
const result = await semanticRelease();
const { GITHUB_OUTPUT } = process.env;
if (GITHUB_OUTPUT) {
  appendFileSync(
    GITHUB_OUTPUT,
    result
      ? `published=true\nversion=${result.nextRelease.version}\ntag=${result.nextRelease.gitTag}\n`
      : 'published=false\n',
  );
}
