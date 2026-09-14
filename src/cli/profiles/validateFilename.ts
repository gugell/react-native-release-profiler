/** Device paths stay in the source; filenames must be safe local basenames. */
export function validateFilename(filename: string): string {
  if (
    !filename ||
    filename === '.' ||
    filename === '..' ||
    /[/\\\0]/.test(filename)
  ) {
    throw new Error('Provide --filename as a basename, not a path.');
  }
  return filename;
}
