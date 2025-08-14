export const getToolDisplayName = (message: any) => {
  if (Array.isArray(message.parts)) {
    const toolPart = message.parts.find((part: any) =>
      part.type?.startsWith("tool-")
    );
    if (toolPart) {
      const toolName = toolPart.type.replace("tool-", "");
      if (toolName.includes("routine")) {
        return "Generating Routine... (Normally takes 1 minute)";
      } else if (toolName.includes("send_mail")) {
        return "Sending Mail...";
      } else if (toolName.includes("detect_skin_type_from_questions")) {
        return "Analyzing Skin Type (Questions)";
      } else if (toolName.includes("analyze_skin_type_from_image")) {
        return "Analyzing Skin Type (Image)";
      }
      return `Using ${toolName}`;
    }
  }
  return "Processing";
};
