import fs from 'fs';

export function normalizeProfile(path: string): void {
  const profile = fs.readFileSync(path, 'utf8');
  const profileJson = JSON.parse(profile);
  const stackFrames = profileJson.stackFrames;
  if (stackFrames !== undefined) {
    for (const key of Object.keys(stackFrames)) {
      const stackFrame = stackFrames[key];
      if (stackFrame.funcVirtAddr && stackFrame.offset) {
        stackFrame.line = `${1}`;
        stackFrame.column = `${
          parseInt(stackFrame.funcVirtAddr) + parseInt(stackFrame.offset) + 1
        }`;
        delete stackFrame.funcVirtAddr;
        delete stackFrame.offset;
      }
    }
    fs.writeFileSync(path, JSON.stringify(profileJson));
  }
}
