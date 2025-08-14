export const formatRoutineText = (text: string) => {
  // Remove any accidental HTML fragments left at the start of lines (e.g. "text-xl font-bold mt-6 mb-2>Evening Routine 🌙")
  let cleaned = text.replace(
    /^([a-zA-Z0-9\-_\s]+>)\s*(Morning Routine|Evening Routine.*)$/gim,
    (_, _junk, heading) => `## ${heading.trim()}`
  );

  // Remove stray HTML fragments at the start of lines (defensive)
  cleaned = cleaned.replace(
    /^([a-zA-Z0-9\-_\s]+>)\s*/gim,
    ""
  );

  return cleaned
    // Headings: ## Morning Routine ☀️, ## Evening Routine 🌙, etc.
    .replace(
      /^## (.*$)/gim,
      (match, p1) => {
        const heading = p1.trim();
        // Special case for "Tips"
        if (heading.toLowerCase() === "tips") {
          return '<p class="text-lg font-bold">Tips</p>';
        }
        // Special case for "Morning Routine" and "Evening Routine"
        if (
          heading.toLowerCase().startsWith("morning routine") ||
          heading.toLowerCase().startsWith("evening routine")
        ) {
          return `<h2 class="text-xl font-bold mt-6 mb-2">${heading}</h2>`;
        }
        // General case for other ## headings
        return `<p class="font-bold">${heading}</p>`;
      }
    )
    .replace(/^### (.*$)/gim, '<p class="font-semibold">$1</p>')
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Double quotes: "text" => <strong>text</strong> (but not if it's inside a code block)
    .replace(/"([^"]+)"/g, '<strong>$1</strong>')
    // STRONG *text* => <strong>text</strong>
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    // Replace newlines with <br> tags
    .replace(/\n/g, "<br>")
    // List items: - text => <li>text</li>
    .replace(/^- (.*$)/gim, '<li class="ml-2">$1</li>')
    // Numbers: 1. text => <p>text</p>
    .replace(/^(\d+\.\s+.*$)/gim, '<p class="text-foreground">$1</p>')
    // Here is your personalized skincare routine: => <p>Here is your personalized skincare routine:</p>
    .replace(
      /^Here is your personalized skincare routine:/gim,
      '<p class="text-lg font-medium ">Here is your personalized skincare routine:</p>'
    );
};
