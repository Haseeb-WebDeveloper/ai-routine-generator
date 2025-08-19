// Helper function to extract content from message parts
export const extractMessageContent = (message: any) => {
  if (typeof message.content === "string" && message.content) {
    return message.content;
  }

  if (Array.isArray(message.parts)) {
    // Check if this is a plan_and_send_routine tool result
    const routineTool = message.parts.find(
      (part: any) =>
        part.type?.startsWith("tool-plan_and_send_routine") &&
        part.state === "output-available" &&
        part.output
    );

    // If we found a routine tool result, use its message or value
    if (routineTool?.output) {
      if (routineTool.output.message) {
        return routineTool.output.message;
      } else if (routineTool.output.value?.message) {
        return routineTool.output.value.message;
      }
    }

    // Otherwise, look for text parts
    const textParts = [];
    for (const part of message.parts) {
      if (part.type === "text" && typeof part.text === "string") {
        textParts.push(part.text);
      }
    }

    if (textParts.length > 0) {
      return textParts.join("");
    }

    // If no text parts, look for any tool output
    for (const part of message.parts) {
      if (part.type?.startsWith("tool-") && part.output) {
        if (part.output.message) {
          return part.output.message;
        } else if (part.output.summary) {
          return part.output.summary;
        }
      }
    }
  }

  return "";
};
