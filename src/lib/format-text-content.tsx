export const formatRoutineText = (text: string) => {
  return text
    .replace(
      /^## (.*$)/gim,
      '<p class="font-bold">$1</p>'
    )
    .replace(/^### (.*$)/gim, '<p class="font-semibold">$1</p>')
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Double quotes: "text" => <strong>text</strong> (but not if it's inside a code block)
    .replace(/"([^"]+)"/g, '<strong>$1</strong>')
    // STRONG *text* => <strong>text</strong>
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
};
