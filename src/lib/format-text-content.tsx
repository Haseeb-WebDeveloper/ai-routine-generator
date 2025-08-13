export const formatRoutineText = (text: string) => {
  return text
    .replace(
      /^## (.*$)/gim,
      '<p class="font-bold">$1</p>'
    )
    .replace(/^### (.*$)/gim, '<p class="font-semibold">$1</p>')
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // .replace(/^(\d+\.\s+.*$)/gim, '<p class="">$1</p>')
    // .replace(/^- (.*$)/gim, '<p class="">• $1</p>')
    // .replace(/\n/g, "<br>");
};
